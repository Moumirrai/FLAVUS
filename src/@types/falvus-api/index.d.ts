declare module 'flavus-api' {

  export interface APIEndpoint {
    path: string;
    rateLimit: number;
    execute: (
      client: import('../../struct/Client').BotClient,
      req: import('express').Request,
      res: import('express').Response
    ) => Promise<unknown>;
  }

  export interface APIInterface {
    EndPoints: Collection<string, iCommand>
  }
}
