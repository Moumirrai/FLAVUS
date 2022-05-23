declare module 'flavus-api' {

  export interface APIEndpoint {
    path: string;
    rateLimit: number;
    execute: (
      client: import('../../struct/Client').BotClient,
      req: import('express').Request,
      res: import('express').Response,
      user: User
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
    EndPoints: Collection<string, iCommand>
  }
}
