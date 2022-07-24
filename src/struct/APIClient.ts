var bodyParser = require('body-parser');
var cors = require('cors');
import { readdirSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import type { APIInterface, APIEndpoint, SocketEvent } from 'flavus-api';
import { Collection } from 'discord.js';
import type { BotClient } from './Client';
import Logger from './Logger';
import express, { request } from 'express';
import http from 'http';
import https from 'https';
import { Server, Socket } from 'socket.io';
import { authUser } from '../API/Auth';
import session, { Session, SessionData } from 'express-session';
import type { iVoiceCache } from 'flavus';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import rateLimit from 'express-rate-limit';

declare module 'http' {
  interface IncomingMessage {
    session: Session & SessionData;
  }
}

declare module 'https' {
  interface IncomingMessage {
    session: Session & SessionData;
  }
}

export class APIClient implements APIInterface {
  EndPoints = new Collection<string, APIEndpoint>();
  SocketEvents = new Collection<string, SocketEvent>();

  public sokcetCache = new Collection<string, Socket>();
  public voiceCache = new Collection<string, iVoiceCache>();

  public async main(client: BotClient): Promise<APIClient> {
    if (
      (client.config.ssl &&
        !existsSync(resolve(client.config.certPath, 'privkey.pem'))) ||
      !existsSync(resolve(client.config.certPath, 'fullchain.pem'))
    ) {
      Logger.error(
        'SSL is enabled but the certs are missing! Switching to HTTP...'
      );
      client.config.ssl = false;
    }

    const app = express();
    const server = client.config.ssl
      ? https.createServer(
          {
            key: readFileSync(resolve(client.config.certPath, 'privkey.pem')),
            cert: readFileSync(resolve(client.config.certPath, 'fullchain.pem'))
          },
          app
        )
      : http.createServer(app);
    const io = new Server(server, { cors: { origin: '*' } });

    await this.loadEndpoints();
    await this.loadSocketEvents();

    const port = process.env.APIPORT || 3000;

    app.use(cors());
    app.use(bodyParser.json());

    const limiter = rateLimit({
      windowMs: 1 * 1000,
      max: 1,
      standardHeaders: true,
      legacyHeaders: false
    });

    app.use(limiter);

    app.use(function (req, res, next) {
      //intercepts OPTIONS method
      if ('OPTIONS' === req.method) {
        //respond with 200
        res.send(200);
      } else {
        next();
      }
    });

    const sessionMiddleware = session({
      cookie: {
        maxAge: 3600000
      },
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false
    });

    app.use(sessionMiddleware);

    app.use(
      async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        if (!req.url.startsWith('/api')) {
          return next();
        }
        if (!req.headers.authorization) {
          return res.status(401).send('Authentification failed!');
        }
        if (req.headers.authorization && req.session.code) {
          if (req.session.code !== req.headers.authorization) {
            const user = await authUser(req.headers.authorization);
            if (user) {
              req.session.code = req.headers.authorization;
              req.session.user = user;
              return next();
            }
            return res.status(401).send('Authentification failed!');
          }
          return next();
        }
        const user = await authUser(req.headers.authorization);
        if (user) {
          req.session.code = req.headers.authorization;
          req.session.user = user;
          return next();
        }
        return res.status(401).send('Authentification failed!');
      }
    );

    const wrap = (middleware: any) => (socket: Socket, next: any) =>
      middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));

    io.use(async (socket, next) => {
      if (!socket.handshake.query.code)
        return next(new Error('Authentification failed!'));
      const code = socket.handshake.query.code.toString();
      if (socket.request.session && socket.request.session.code === code) {
        return next();
      }
      const user = await authUser(code);
      if (user) {
        socket.request.session.code = code;
        socket.request.session.user = user;
        return next();
      }
      return next(new Error('Authentification failed!'));
    });

    io.on('connection', (socket: Socket) => {
      for (const [name, event] of this.SocketEvents) {
        const rateLimiter = new RateLimiterMemory(event.rateLimit);
        socket.on(name, async (data) => {
          try {
            await rateLimiter.consume(socket.request.session.user.id);
            event.execute(client, socket, data);
          } catch (e) {
            socket.emit('rateLimit', `Slow down!`);
          }
        });
      }
      client.emit('apiHandleConnect', socket);
      socket.on('disconnect', () => {
        client.emit('apiHandleDisconnect', socket);
      });
    });

    app.post('/api/:path', async (req, res) => {
      const path = req.params.path;
      const endpoint = this.EndPoints.get(path);
      if (!endpoint) return res.status(404).send('404 Not Found');
      await endpoint.execute(client, req, res);
    });

    server.listen(port, () => Logger.info(`API running on port ${port}`));
    return this;
  }

  private async loadEndpoints(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'API', 'endpoints'));
    for (const file of files) {
      const endpoint: APIEndpoint = (
        await import(resolve(__dirname, '..', 'API', 'endpoints', file))
      ).default;
      this.EndPoints.set(endpoint.path, endpoint);
    }
    Logger.info(`${this.EndPoints.size} API endpoints loaded!`);
  }

  private async loadSocketEvents(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'API', 'socketEvents'));
    for (const file of files) {
      const socketEvent: SocketEvent = (
        await import(resolve(__dirname, '..', 'API', 'socketEvents', file))
      ).default;
      this.SocketEvents.set(socketEvent.name, socketEvent);
    }
    Logger.info(`${this.SocketEvents.size} socket events loaded!`);
  }
}
