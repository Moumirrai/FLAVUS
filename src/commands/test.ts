import { Message, MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';
import { Track } from 'erela.js';

const DebugCommand: iCommand = {
  name: 'test',
  aliases: [],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: false,
  description: 'debug',
  usage: '<prefix>test',
  async execute({
    client,
    message,
  }: CommandArgs): Promise<void | Message> {
    console.log(client.apiClient.cache.rooms);
  }
};

export default DebugCommand;
