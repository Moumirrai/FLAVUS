declare module 'socket.io' {
  export interface Socket {
    interval: Timer;
    //set type for socket.request.session
    //TODO: rewrite to socket.session
    request: {
      session: {
        user: {
          id: string;
        };
        code: string;
      };
    };
  }
}


