import type { BotConfig } from '../../config/config';
import type { LavalinkManager } from '../../struct/Erela/LavalinkManager';
import type { APICore } from '../../API/APIClient';

declare module 'discord.js' {
  export interface Client {
    config: BotConfig;
    lyrics: any;
    manager: LavalinkManager;
    apiClient: APICore;
  }
}
