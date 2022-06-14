import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { SocketEvent } from 'flavus-api';
import { GuildModel } from '../../models/guildModel';

const AutoplayCommand: SocketEvent = {
  name: 'test',
  async execute(client, socket, data): Promise<any> {
    socket.emit('test', "a co jako?")
    console.log(data)
  }
};

export default AutoplayCommand;
