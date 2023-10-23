//import bodyParser from 'body-parser';
import cors from 'cors';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import type {
  APIInterface,
  APIEndpoint,
  SocketEvent,
  Room,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  iVoiceCache
} from 'flavus-api';
import { Collection, Events } from 'discord.js';
import type { Core } from '../../struct/Core';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { authUser } from '../authManager';
import { Session, SessionData } from 'express-session';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import rateLimit from 'express-rate-limit';
import roomManager from '../roomManager';
import playerPing from '../playerPing';
import {
  handleConnectSocketEvent,
  handleDisconnectSocketEvent
} from '../../handlers';

import { sessionMiddleware, authMiddleware } from '../middlewares';

declare module 'http' {
  interface IncomingMessage {
    session: Session & SessionData;
  }
}
export class APICore implements APIInterface {
  public readonly EndPoints = new Collection<string, APIEndpoint>();
  public readonly SocketEvents = new Collection<string, SocketEvent>();
  public readonly client: Core;
  public roomManager: roomManager;
  public playerPing: playerPing;
  public io: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  public cache = {
    voiceStates: new Collection<string, iVoiceCache>(),
    sockets: new Collection<string, Socket>(),
    rooms: new Collection<string, Room>()
  };

  constructor(client: Core) {
    this.client = client;
    this.roomManager = new roomManager(this);
    this.playerPing = new playerPing(this);
    this.main();
  }

  private async main(): Promise<APICore> {
    const app = express();
    const server = http.createServer(app);
    //TODO: add cors to config
    this.io = new Server(server, { cors: { origin: '*' } });

    await this.loadEndpoints();
    await this.loadSocketEvents();

    const port = process.env.APIPORT || 3030;

    APICore.configApp(app, this.client);

    const wrap = (middleware: any) => (socket: Socket, next: any) =>
      middleware(socket.request, {}, next);

    this.io.use(wrap(sessionMiddleware));

    this.io.use(async (socket, next) => {
      if (!socket.handshake.query.code)
        return next(new Error('Authentication failed!  - Code 3'));
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
      return next(new Error('Authentication failed!'));
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
            await event.execute(this.client, socket, data);
          } catch (e) {
            socket.volatile.emit('api:rateLimit', 'Slow down!');
          }
        });
      }
      console.log('emmitting');
      handleConnectSocketEvent(this.client, socket);
      //this.client.emit(Events.HandleConnectSocketWhy, socket);
      /*
      TODO: After a socket is disconnected, it is removed from its rooms, 
      but they are not cleared from the cache because the socket no 
      longer references it. Fix it!
      */

      socket.on('disconnect', () => {
        handleDisconnectSocketEvent(this.client, socket);
        //this.client.emit(Events.HandleDisconnectSocket, socket);
      });
    });

    /*
    this.io.of('/').adapter.on('create-room', (room) => {
      console.log('room created ' + room);
    });
    */
    this.io.of('/').adapter.on('delete-room', (room) => {
      this.roomManager.destroyRoom(room);
    });
    /*
    this.io.of('/').adapter.on('join-room', (room) => {
      console.log('room joined ' + room);
    });
    this.io.of('/').adapter.on('leave-room', (room, id) => {
      console.log('room left ' + room);
    });
    */

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

    //starts api
    server.listen(port, () =>
      this.client.logger.info(`API running on port ${port}`)
    );
    return this;
  }

  private async loadEndpoints(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'endpoints'));
    for (const file of files) {
      const endpoint: APIEndpoint = (
        await import(resolve(__dirname, '..', 'endpoints', file))
      ).default;
      this.EndPoints.set(endpoint.path, endpoint);
    }
    this.client.logger.info(`${this.EndPoints.size} API endpoints loaded!`);
  }

  private async loadSocketEvents(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'socketEvents'));
    for (const file of files) {
      const socketEvent: SocketEvent = (
        await import(resolve(__dirname, '..', 'socketEvents', file))
      ).default;
      this.SocketEvents.set(socketEvent.name, socketEvent);
    }
    this.client.logger.info(`${this.SocketEvents.size} socket events loaded!`);
  }

  /**
   * Apply middlewares and configs like limiters and to express app
   * @param app express app
   */

  private static configApp(app: express.Application, client: Core): void {
    app.use(cors());
    //app.use(bodyParser.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    //use 1sec limit for all requests
    const limiter = rateLimit({
      windowMs: 1000,
      max: 1,
      standardHeaders: true,
      legacyHeaders: false
    });
    app.use(limiter);
    //interception of OPTIONS method
    app.use((req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.send(200);
      } else {
        next();
      }
    });
    app.use(sessionMiddleware);

    app.use(authMiddleware(client));
  }
}
