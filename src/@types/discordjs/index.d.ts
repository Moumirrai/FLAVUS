import type { Client } from 'discord.js';
import type { BotConfig } from '../../config/config';
import type { LavalinkHandler } from '../../struct/Erela/LavalinkHandler';

declare module 'discord.js' {
  export interface Client {
    config: BotConfig;
    lyrics: any;
    manager: LavalinkHandler;
  }
}
