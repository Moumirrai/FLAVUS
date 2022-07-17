import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { SocketEvent } from 'flavus-api';
import { GuildModel } from '../../models/guildModel';

//TODO: delete

const DebugEvent: SocketEvent = {
  name: 'test',
  rateLimit: {
    points: 1,
    duration: 1
  },
  async execute(client, socket, data): Promise<any> {
    console.log(socket.request.session.user.id);
    console.log(data);
  }
};

export default DebugEvent;
