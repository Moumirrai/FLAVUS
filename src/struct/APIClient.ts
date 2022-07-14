var bodyParser = require('body-parser');
var cors = require('cors');
import { readdirSync } from 'fs';
import { resolve } from 'path';
import type {
  APIInterface,
  APIEndpoint,
  UserInterface,
  SocketEvent
} from 'flavus-api';
import { Collection } from 'discord.js';
import type { BotClient } from './Client';
import Logger from './Logger';
import express, { request } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { authUser } from '../API/Auth';
import session, { Session, SessionData } from 'express-session';
import { getPlayer } from '../API/player';
import type { iVoiceCache } from 'flavus';

declare module 'http' {
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
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: '*' } });

    await this.loadEndpoints();
    await this.loadSocketEvents();

    const port = process.env.APIPORT || 3000;

    app.use(cors());
    app.use(bodyParser.json());

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

    //create middleware that will check if request has 'code' header, if yes start session and store it in req.session
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
          client.logger.error('No authorization header found!');
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
            client.logger.error('Authentification failed!');
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
        client.logger.error('Authentification failed 2!');
        return res.status(401).send('Authentification failed!');
      }
    );

    const wrap = (middleware: any) => (socket: Socket, next: any) =>
      middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));

    io.use(async (socket, next) => {
      if (!socket.handshake.query.code) return next(new Error('Authentification failed!'));
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

    //wrap sessions to sockets

    io.on('connection', (socket: Socket) => {
      for (const [name, event] of this.SocketEvents) {
        socket.on(name, (data) => {
          event.execute(client, socket, data);
        });
      }
      client.emit('apiHandleConnect', socket);
      if (!socket.interval) {
        socket.interval = setInterval(() => getPlayer(client, socket), 1000);
      }
      socket.on('disconnect', () => {
        clearInterval(socket.interval);
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
