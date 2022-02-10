declare module 'my-module' {
  export interface CommandArgs {
    client: import('../../struct/Client').BotClient;
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
    voiceRequired: boolean;
    playerRequired: boolean;
    sameChannelRequired: boolean;
    joinPermissionRequired: boolean;
    visible: boolean;
    execute: (commandArgs: CommandArgs) => Promise<unknown>;
  }
  export interface iEvent {
    name: string;
    execute: (
      client: import('../../struct/Client').BotClient,
      ...args: any[]
    ) => Promise<unknown>;
  }
  export interface iManagerEvent {
    name: string;
    execute: (
      client: import('../../struct/Client').BotClient,
      manager: import('erela.js').Manager,
      ...args: any[]
    ) => Promise<unknown>;
  }
}
