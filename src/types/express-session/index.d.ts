import { User } from 'discord.js';

declare module 'express-session' {
  export interface SessionData {
    code: string;
    user: User;
    createdAt: number;
  }
}
