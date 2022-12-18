import bodyParser = require('body-parser');
import cors = require('cors');
import { readdirSync, existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import type { APIInterface, APIEndpoint, SocketEvent, Room } from 'flavus-api';
import { Collection } from 'discord.js';
import { Core } from './Core';
import Logger from './Logger';
import express from 'express';
import http from 'http';
import https from 'https';
import { Server, Socket } from 'socket.io';
import { authUser } from './API/authManager';
import session, { Session, SessionData } from 'express-session';
import type { iVoiceCache } from 'flavus';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import rateLimit from 'express-rate-limit';
import roomManager from './API/roomManager';
import { config } from 'dotenv';

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

export class APICore implements APIInterface {
  public readonly EndPoints = new Collection<string, APIEndpoint>();
  public readonly SocketEvents = new Collection<string, SocketEvent>();
  public client: Core;
  public roomManager: roomManager;
  public io: Server;

  public cache = {
    voiceStates: new Collection<string, iVoiceCache>(),
    sockets: new Collection<string, Socket>(),
    rooms: new Collection<string, Room>()
  };

  constructor(client: Core) {
    this.client = client;
    this.roomManager = new roomManager(this);
    this.main();
  }

  private async main() {
    if (
      (this.client.config.ssl &&
        !existsSync(resolve(this.client.config.certPath, 'privkey.pem'))) ||
      !existsSync(resolve(this.client.config.certPath, 'fullchain.pem'))
    ) {
      Logger.error(
        'SSL is enabled but the certs are missing! Switching to HTTP...'
      );
      this.client.config.ssl = false;
    }

    const app = express();
    const server = this.client.config.ssl
      ? https.createServer(
          {
            key: readFileSync(
              resolve(this.client.config.certPath, 'privkey.pem')
            ),
            cert: readFileSync(
              resolve(this.client.config.certPath, 'fullchain.pem')
            )
          },
          app
        )
      : http.createServer(app);
    this.io = new Server(server, { cors: { origin: '*' } });

    await this.loadEndpoints();
    await this.loadSocketEvents();

    const port = process.env.APIPORT || 3000;

    await this.configApp(app);

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
          this.client.logger.log(
            'Authentification failed! - No authorization header'
          );
          return res.status(401).send('Authentification failed!');
        }
        //allow metrics endpoint to be accessed without auth
        if (
          req.url.startsWith('/api/metrics') &&
          req.headers.authorization === process.env.METRICS_TOKEN
        ) {
          return next();
        }
        if (req.headers.authorization && req.session.code) {
          //TODO: parse and inherit expiration from config
          if (req.session.code !== req.headers.authorization || !req.session.createdAt || new Date().getTime() - req.session.createdAt >
          604800000) {
            const user = await authUser(req.headers.authorization, this.client);
            if (user) {
              req.session.code = req.headers.authorization;
              req.session.user = user;
              req.session.createdAt = new Date().getTime();
              return next();
            }
            this.client.logger.log(
              'Authentification failed! - Invalid authorization header'
            );
            return res.status(401).send('Authentification failed!');
          }
          return next();
        }
        const user = await authUser(req.headers.authorization, this.client);
        if (user) {
          req.session.code = req.headers.authorization;
          req.session.user = user;
          req.session.createdAt = new Date().getTime();
          return next();
        }
        this.client.logger.log('Authentification failed!');
        return res.status(401).send('Authentification failed!');
      }
    );

    const wrap = (middleware: any) => (socket: Socket, next: any) =>
      middleware(socket.request, {}, next);

    this.io.use(wrap(sessionMiddleware));

    this.io.use(async (socket, next) => {
      if (!socket.handshake.query.code)
        return next(new Error('Authentification failed!'));
      const code = socket.handshake.query.code.toString();
      if (socket.request.session && socket.request.session.code === code) {
        return next();
      }
      const user = await authUser(code, this.client);
      if (user) {
        socket.request.session.code = code;
        socket.request.session.user = user;
        socket.request.session.createdAt = new Date().getTime();
        return next();
      }
      return next(new Error('Authentification failed!'));
    });

    this.io.on('connection', (socket: Socket) => {
      for (const [name, event] of this.SocketEvents) {
        const rateLimiter = new RateLimiterMemory(event.rateLimit);
        socket.on(name, async (data) => {
          try {
            await rateLimiter.consume(socket.request.session.user.id);
            this.client.logger.log(
              `Socket event: "${name}" with data: ${JSON.stringify(data)}`
            );
            event.execute(this.client, socket, data);
          } catch (e) {
            socket.emit('rateLimit', `Slow down!`);
          }
        });
      }
      this.client.emit('apiHandleConnect', socket);
      /*
      After a socket is disconnected, it is removed from its rooms, 
      but they are not cleared from the cache because the socket no 
      longer references it. Fix!!
      */
      socket.on('disconnect', () => {
        this.client.emit('apiHandleDisconnect', socket);
      });
    });

    app.post('/api/:path', async (req, res) => {
      const path = req.params.path;
      const endpoint = this.EndPoints.get(path);
      this.client.logger.log(
        `Endpoint event: "${endpoint.path}" with query: ${JSON.stringify(
          req.query
        )} and data: ${JSON.stringify(req.body)}`
      );
      if (!endpoint) return res.status(404).send('404 Not Found');
      await endpoint.execute(this.client, req, res);
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

  private async configApp(app: express.Application): Promise<void> {
    app.use(cors());
    app.use(bodyParser.json());
    //use 1sec limit for all requests
    const limiter = rateLimit({
      windowMs: 1 * 1000,
      max: 1,
      standardHeaders: true,
      legacyHeaders: false
    });
    app.use(limiter);
    //interception of OPTIONS method
    app.use(function (req, res, next) {
      if ('OPTIONS' === req.method) {
        res.send(200);
      } else {
        next();
      }
    });
  }
}
