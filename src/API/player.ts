import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { GuildModel } from '../models/guildModel';
import type { Player } from 'erela.js';
import { Socket } from 'socket.io';
import { BotClient } from '../struct/Client';
import format from 'format-duration';

//TODO: send less data per second - send only whats neaded, do not send something that does not need to update
/*
position - every second if not paused
paused - send only if changed
queue - send only on update (probably by comparing some hash or lenght)
userConnected - only when changed
deafened - probably remove
guild - only if changed
player - only if present, no need to send null
volume - remove, useless
*/

export async function getPlayer(client: BotClient, socket: Socket) {
  const voiceState = client.APICache.voice.get(socket.request.session.user.id);
  if (!voiceState)
    return socket.volatile.emit('playerData', { userConnected: false });
  const player: Player = client.manager.players.get(
    voiceState.voiceChannel.guild.id
  );
  if (player) {
    return socket.volatile.emit('playerData', {
      userConnected: true,
      ready: true,
      guild: {
        name: voiceState.voiceChannel.guild.name,
        avatar: voiceState.voiceChannel.guild.iconURL()
      },
      player: {
        current: player.queue.current
          ? {
              title: player.queue.current.title,
              author: player.queue.current.author,
              length: player.queue.current.duration,
              thumbnail: player.queue.current.thumbnail,
              position: player.position,
              percentage: calculatePercentage(player.position, player.queue.current.duration),
              timeStrings: {
                position: formatTime(player.position),
                duration: formatTime(player.queue.current.duration)
              }
            }
          : null,
        queue: player.queue.map((song) => {
          return {
            title: song.title,
            author: song.author,
            length: song.duration,
            thumbnail: song.thumbnail,
            duration: formatTime(song.duration)
          };
        }),
        paused: player.paused,
      }
    });
  }
  return socket.volatile.emit('playerData', {
    userConnected: true,
    deafened: voiceState.deafened,
    ready: false,
    guild: {
      name: voiceState.voiceChannel.guild.name,
      avatar: voiceState.voiceChannel.guild.iconURL()
    },
    player: null
  });
}

function formatTime(time: number) {
  return format(Math.round(time), { leading: true });
}

//create function that takes position and duration, and calculates percentage of progress

function calculatePercentage(position: number, duration: number) {
  const progress = (position / duration) * 100;
  return Math.round(progress * 10000000) / 10000000;
}
