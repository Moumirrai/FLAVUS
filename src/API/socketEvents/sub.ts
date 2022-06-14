import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { SocketEvent } from 'flavus-api';
import { GuildModel } from '../../models/guildModel';

//TODO: fix or delete

const AutoplayCommand: SocketEvent = {
  name: 'sub',
  async execute(client, socket, data): Promise<any> {
    console.log(data)
    /*
      socket.interval = setInterval(() => {
        socket.emit('debug', 'pong');
      }, 1000);
      */
  }
};

export default AutoplayCommand;
