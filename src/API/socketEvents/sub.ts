import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { SocketEvent } from 'flavus-api';
import { GuildModel } from '../../models/guildModel';

const AutoplayCommand: SocketEvent = {
  name: 'sub',
  async execute(client, socket, data): Promise<any> {
    console.log(data)
  }
};

export default AutoplayCommand;
