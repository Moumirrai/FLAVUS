declare module 'flavus-api' {
  export interface APIEndpoint {
    path: string;
    rateLimit: number;
    execute: (
      client: import('../../struct/Core').Core,
      req: import('express').Request,
      res: import('express').Response
    ) => Promise<unknown>;
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
      io: import('socket.io').Socket,
      data: unknown
    ) => Promise<unknown>;
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
  }

  export interface APIInterface {
    EndPoints: Collection<string, APIEndpoint>;
    SocketEvents: Collection<string, SocketEvent>;
  }
}
