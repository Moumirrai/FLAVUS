import type { SessionData } from 'express-session';
import type { UserInterface } from 'flavus-api';

declare module 'express-session' {
  export interface SessionData {
    code: string;
    user: UserInterface;
    createdAt: number;
  }
}
