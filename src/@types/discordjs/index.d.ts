import type { Message, Client } from 'discord.js';
import type { BotConfig, config } from '../config/config';
import type { DiscordTogether } from 'discord-together';
import type { LavalinkHandler } from './structures/Music/LavalinkHandler';
import type { iCommand } from 'my-module';
import { Collection } from 'mongoose';

declare module 'discord.js' {
  export interface Client {
    config: BotConfig;
    DiscordTogether: DiscordTogether;
    lyrics: any;
    manager: LavalinkHandler;
  }
}
