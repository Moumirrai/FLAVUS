import type { Player } from 'erela.js';
import type { Core } from '../struct/Core';
import { PlayerData, QueueData } from 'flavus-api';
import type { APICore } from './client/APICore';
import hash from 'hash-sum';

//TODO: send less data per second - send only whats needed, do not send something that does not need to update
/*
position - every second if not paused
paused - send only if changed
queue - send only on update (probably by comparing some hash or length)
userConnected - only when changed
deafened - probably remove
guild - only if changed
player - only if present, no need to send null
volume - remove, useless
*/

export default class roomPing {
  private client: Core;

  constructor(APIcore: APICore) {
    this.client = APIcore.client;
  }

  public async playerData(room: string): Promise<Boolean> {
    if (
      !this.client.apiClient.io.sockets.adapter.rooms.has(room) ||
      !this.client.apiClient.cache.rooms.has(room)
    )
      return;
    const player: Player = this.client.manager.players.get(room);
    if (!player)
      return this.playerEmitter(room, {
        state: true,
        guild: {
          name: this.client.guilds.cache.get(room).name,
          avatar: this.client.guilds.cache.get(room).iconURL()
        },
        player: undefined
      });
    if (!player.queue.current) {
      return this.playerEmitter(room, {
        state: true,
        playing: false,
        paused: false,
        player: undefined,
        guild: {
          name: this.client.guilds.cache.get(player.guild).id,
          avatar: this.client.guilds.cache.get(player.guild).iconURL()
        }
      });
    }
    return this.playerEmitter(room, {
      state: true,
      playing: true,
      paused: player.paused,
      position: player.position,
      guild: {
        name: this.client.guilds.cache.get(player.guild).id,
        avatar: this.client.guilds.cache.get(player.guild).iconURL()
      },
      player: {
        current: {
          title: player.queue.current.title,
          author: player.queue.current.author,
          duration: player.queue.current.duration,
          thumbnail: player.queue.current.thumbnail,
          identifier: player.queue.current.identifier
        },
        queue: {
          size: player.queue.size,
          hash: hash(player.queue)
        }
      }
    });
  }

  public async queueData(room: string): Promise<Boolean> {
    if (
      !this.client.apiClient.io.sockets.adapter.rooms.has(room) ||
      !this.client.apiClient.cache.rooms.has(room)
    )
      return;
    const player: Player = this.client.manager.players.get(room);
    const data = await this.getQueueData(player);
    return this.queueEmitter(room, data);
  }

  public async getQueueData(player: Player): Promise<QueueData> {
    if (!player || !player.queue.current || !player.queue.size)
      return {
        hash: player ? player.hash : undefined,
        size: 0,
        tracks: []
      };
    return {
      //hash: hash(player.queue),
      hash: player ? player.hash : undefined,
      size: player.queue.size,
      tracks: player.queue.map((song) => {
        return {
          title: song.title,
          author: song.author,
          duration: song.duration,
          thumbnail: song.thumbnail
        };
      })
    };
  }

  private async playerEmitter(room: string, data: PlayerData) {
    if (!this.client.apiClient.io.sockets.adapter.rooms.has(room)) return;
    return this.client.apiClient.io.to(room).volatile.emit('player:data', data);
  }

  private async queueEmitter(room: string, data: QueueData) {
    if (!this.client.apiClient.io.sockets.adapter.rooms.has(room)) return;
    return this.client.apiClient.io.to(room).emit('player:queueData', data);
  }
}

/*


export async function getPlayer(client: Core, socket: Socket) {
  const voiceState = client.apiClient.cache.voiceStates.get(socket.request.session.user.id);
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
              identifier: player.queue.current.identifier,
              position: player.position,
            }
          : null,
        queue: player.queue.map((song) => {
          return {
            title: song.title,
            author: song.author,
            length: song.duration,
            thumbnail: song.thumbnail,
            identifier: song.identifier,
            duration: song.duration,
          };
        }),
        paused: player.paused
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

*/
