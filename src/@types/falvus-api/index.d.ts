declare module 'flavus-api' {
  export interface APIEndpoint {
    path: string;
    execute: (
      client: import('../../struct/Core').Core,
      req: import('express').Request,
      res: import('express').Response
    ) => Promise<import('express').Response> | import('express').Response;
  }

  export interface Room {
    id: string;
    members: string[];
    interval: Timer | null;
  }

  export interface AuthResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
  }

  export interface SocketEvent {
    name: string;
    rateLimit: {
      points: number;
      duration: number;
    };
    execute: (
      client: import('../../struct/Core').Core,
      io: import('socket.io').Socket<ClientToServerEvents, ServerToClientEvents>,
      data?: unknown
    ) => Promise<unknown> | void | boolean;
  }

  export interface UserInterface {
    id: string;
    username: string;
    avatar: string;
    avatar_decoration: any;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: any;
    banner_color: any;
    accent_color: any;
    locale: string;
    mfa_enabled: boolean;
    guilds: userGuilds;
  }

  export interface userGuilds {
    active: import('discord-oauth2').PartialGuild[];
    notActive: import('discord-oauth2').PartialGuild[];
  }

  export interface APIInterface {
    readonly EndPoints: Collection<string, APIEndpoint>;
    readonly SocketEvents: Collection<string, SocketEvent>;
  }

  export interface ResultHandlerInterface {
    type: 'TRACK' | 'PLAYLIST';
    tracks: { title: string; author: string; duration: number; uri: string }[];
    playlistName?: string;
    nowPlaying?: boolean;
    error?: boolean;
  }

  export interface PlayerData {
    state?: boolean;
    playing?: boolean;
    position?: number;
    paused?: boolean;
    queueRepeat?: boolean;
    guild?: {
      name: string;
      avatar: string;
    };
    player?: {
      current?: {
        title: string;
        author: string;
        duration: number;
        thumbnail: string;
        identifier: string;
      };
      queue?: {
        size: number;
        hash: string;
      };
    };
  }

  export interface QueueData {
    size: number;
    hash: string;
    tracks: {
      title: string;
      author: string;
      duration: number;
      thumbnail: string;
    }[];
  }

  
  export enum ClientToServerEnum {
    'player:addTrack' = 'player:addTrack',
    'player:clearQueue' = 'player:clearQueue',
    'player:moveTrack' = 'player:moveTrack',
    'player:pause' = 'player:pause',
    'player:removeTrack' = 'player:removeTrack',
    'player:seek' = 'player:seek',
    'player:skip' = 'player:skip',
    'player:stop' = 'player:stop',
    'player:test' = 'player:test'
  }

  /*

  export type ClientToServerEvents = {
    'player:addTrack': (payload: string) => void;
    'player:clearQueue': () => void;
    'player:moveTrack': (payload: {
      removedIndex: number;
      addedIndex: number;
    }) => void;
    'player:pause': (payload: boolean) => void;
    'player:removeTrack': (payload: number) => void;
    'player:seek': (payload: number) => void;
    'player:skip': (payload: number) => void;
    'player:stop': () => void;
    'player:test': (payload: any) => void;
  };

  export type ServerToClientEvents = {
    'player:data': (payload: PlayerData) => void;
    'player:queueData': (payload: QueueData) => void;
  };

  export type InterServerEvents = {};
  export type SocketData = {};

  */

  interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
  }

  interface ClientToServerEvents {
    hello: () => void;
  }

  export type InterServerEvents = {};
  interface SocketData {
    pepe: string;
  }

  export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    ['player:data']: (payload: PlayerData) => void;
    ['player:queueData']: (payload: QueueData) => void;
    ['player:trackAdded']: (payload: import('flavus-api').ResultHandlerInterface) => void;
    ['player:error']: (payload: string) => void;
    ['api:rateLimit']: (payload: string) => void;
  }

  export interface ClientToServerEvents {
    hello: () => void;
  }

  export interface SocketData {
    name: string;
    age: number;
  }
}
