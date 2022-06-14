import type { Client } from 'discord.js';
import type { BotConfig } from '../config/config';
import type { DiscordTogether } from 'discord-together';
import type { LavalinkHandler } from './structures/Music/LavalinkHandler';

declare module 'discord.js' {
  export interface Client {
    config: BotConfig;
    DiscordTogether: DiscordTogether;
    lyrics: any;
    manager: LavalinkHandler;
  }
}
