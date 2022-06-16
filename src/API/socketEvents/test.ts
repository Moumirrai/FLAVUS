import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { SocketEvent } from 'flavus-api';
import { GuildModel } from '../../models/guildModel';

//TODO: delete

const AutoplayCommand: SocketEvent = {
  name: 'test',
  async execute(client, socket, data): Promise<any> {
    const userId = socket.request.session.user.id
    //check if user is connected to voice channel
    /*
    const guild = client.guilds.cache.get(data.guildId)
    const member = guild.members.cache.get(userId)
    if (!member) return socket.emit('error', 'You are not in a voice channel!')
    if (!member.voice.channel) return socket.emit('error', 'You are not in a voice channel!')
    */
  }
};

export default AutoplayCommand;
