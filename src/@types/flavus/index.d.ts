declare module 'flavus' {
  export interface Command {
    name: string;
    description: string;
    aliases?: string[];
    usage?: string;
    requirements?: CommandRequirements;
    visible?: boolean;
    execute: (
      commandArgs: CommandArgs
    ) =>
      | import('discord.js').Message<boolean>
      | Promise<
          | void
          | import('discord.js').Message<boolean>
          | import('discord.js').MessageReaction
        >
      | void;
  }

  //conditions for a command to be executed
  export interface CommandRequirements {
    voiceRequired?: boolean;
    playerRequired?: boolean;
    currentTrackRequired?: boolean;
    sameChannelRequired?: boolean;
    joinPermissionRequired?: boolean;
    devOnly?: boolean;
  }

  //arguments passed to a command
  export interface CommandArgs {
    client: import('../../struct/Core').Core;
    message: import('discord.js').Message;
    args: string[];
    manager: import('erela.js').Manager;
    player?: import('erela.js').Player;
    vc?: import('discord.js').VoiceBasedChannel;
  }
  //client events
  export interface iEvent {
    name: string;
    execute: (client: import('../../struct/Core').Core, ...args: any[]) => void;
  }
  //manager events
  export interface iManagerEvent {
    name: string;
    execute: (
      client: import('../../struct/Core').Core,
      manager: import('erela.js').Manager,
      ...args: any[]
    ) => void;
  }

  export interface iVoiceCache {
    voiceChannel: import('discord.js').VoiceChannel;
    user: import('discord.js').User;
    guildId: string;
    deafened: boolean;
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
