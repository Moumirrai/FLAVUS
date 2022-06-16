import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { SocketEvent } from 'flavus-api';
import { GuildModel } from '../../models/guildModel';
import type { Player } from 'erela.js';

//TODO: fix or delete

const AutoplayCommand: SocketEvent = {
  name: 'player',
  async execute(client, socket, data): Promise<any> {
    const enable = data === 'true';
    if (enable && !socket.interval) {
      socket.interval = setInterval(() => getPlayer(client, socket), 1000);
    }
    if (!enable) {
      clearInterval(socket.interval);
    }
  }
};

async function getPlayer(client, socket) {
  const player: Player = client.manager.players.get('881805579469856769');
  if (player && player.queue.current) {
    //calculate progress percentage from player.position and player.queue.current.duration
    //round progress to 7 decimal places
    const progress = Number(((player.position / player.queue.current.duration) * 100).toFixed(8));
    socket.volatile.emit('playerData', {
      current: {
        title: player.queue.current.title,
        duration: player.queue.current.duration,
        author: player.queue.current.author,
        uri: player.queue.current.uri,
        thumbnail: player.queue.current.thumbnail,
      },
      paused: player.paused,
      position: progress
    });
  }
}

export default AutoplayCommand;
