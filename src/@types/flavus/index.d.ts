declare module 'flavus' {
  export interface CommandArgs {
    client: import('../../struct/Core').Core;
    message: import('discord.js').Message;
    args: string[];
    manager: import('erela.js').Manager;
    player?: import('erela.js').Player;
    vc?: import('discord.js').VoiceBasedChannel;
  }
  export interface iCommand {
    name: string;
    aliases: string[];
    description: string;
    usage: string;
    voiceRequired?: boolean;
    playerRequired?: boolean;
    sameChannelRequired?: boolean;
    joinPermissionRequired?: boolean;
    visible: boolean;
    execute: (commandArgs: CommandArgs) => Promise<unknown>;
  }
  export interface iEvent {
    name: string;
    execute: (
      client: import('../../struct/Core').Core,
      ...args: any[]
    ) => Promise<unknown>;
  }

  export interface socketResponse {
    type: 'playerError' | 'playerMessage';
    content: string;
  }

  export interface iVoiceCache {
    voiceChannel: import('discord.js').VoiceChannel;
    user: import('discord.js').User;
    guildId: string;
    deafened: boolean;
  }

  export interface iManagerEvent {
    name: string;
    execute: (
      client: import('../../struct/Core').Core,
      manager: import('erela.js').Manager,
      ...args: any[]
    ) => Promise<unknown>;
  }

  export interface iSpotifySearchResult {
    tracks: {
      items: import('better-erela.js-spotify/dist/plugin').SpotifyTrack[];
    };
  }

  export interface iSpotifyRecommResult {
    tracks: import('better-erela.js-spotify/dist/plugin').SpotifyTrack[];
  }
}
