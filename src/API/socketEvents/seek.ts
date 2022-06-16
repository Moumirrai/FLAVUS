import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { SocketEvent } from 'flavus-api';
import { GuildModel } from '../../models/guildModel';
import type { Player } from 'erela.js';

//TODO: fix or delete

const AutoplayCommand: SocketEvent = {
  name: 'seek',
  async execute(client, socket, data: number): Promise<any> {
    const player: Player = client.manager.players.get('881805579469856769');
    if (player) {
      if (typeof data !== 'number') console.log('data is not number');
      player.seek(data);
    }
  }
};

export default AutoplayCommand;
