import type { Message, Client } from 'discord.js';
import type { BotConfig, config } from '../config/config';
import type { DiscordTogether } from 'discord-together';
import type { LavalinkHandler } from './structures/Music/LavalinkHandler';
import type { iCommand } from 'my-module';
import { Collection } from 'mongoose';
impo;

declare module 'socket.io' {
  export interface Socket {
    interval: Timer;
    //set type for socket.request.session
    request: {
      session: {
        user: {
          id: string;
        };
      };
    };
  }
}
