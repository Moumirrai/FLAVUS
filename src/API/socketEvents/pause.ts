import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { SocketEvent } from 'flavus-api';
import { GuildModel } from '../../models/guildModel';
import type { Player } from 'erela.js';

//TODO: fix or delete

const PauseEvent: SocketEvent = {
  name: 'pause',
  async execute(client, socket, data: boolean): Promise<any> {
    const player: Player = client.manager.players.get('881805579469856769');
    if (player) {
      if (typeof data !== 'boolean') console.log('data is not boolean');
      player.pause(data);
      socket.volatile.emit('playerData', {
        paused: player.paused,
      });
    }
  }
};

export default PauseEvent;
