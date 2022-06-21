import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { SocketEvent } from 'flavus-api';
import { GuildModel } from '../../models/guildModel';

//TODO: delete

const DebugEvent: SocketEvent = {
  name: 'test',
  async execute(client, socket, data): Promise<any> {
    console.log(data)
    return
  }
};

export default DebugEvent;
