import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  User
} from 'discord.js';
import { CommandArgs, iCommand } from 'my-module';
import formatDuration = require('format-duration');
import { Player } from 'erela.js';

//define typo for player.queue.current.requester as User


const GrabCommand: iCommand = {
  name: 'debug',
  aliases: ['test'],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: false,
  description: 'Sends info about the current track to your DM',
  usage: '<prefix>grab',
  async execute({ client, message }: CommandArgs): Promise<void | Message> {
    const response = await client.functions.fetchGuildConfig('855437560695488562');
    console.log(response);
    message.channel.send(`pepe`)
  }
};

export default GrabCommand;
