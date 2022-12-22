import { SocketEvent } from 'flavus-api';
import { Player } from 'erela.js';
import { getPlayer } from '../player';

interface IUnresolvedTrack {
  title: string;
  author: string;
  duration: number;
}

const PauseEvent: SocketEvent = {
  name: 'removeTrack',
  rateLimit: {
    points: 5,
    duration: 1
  },
  async execute(client, socket, data: number): Promise<boolean> {
    if (typeof data !== 'number')
      return socket.emit('playerError', 'Track index must be a number!');
    const voiceCache = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('playerError', "I can't see you connected!");

    const player: Player = client.manager.players.get(
      client.apiClient.cache.voiceStates.get(socket.request.session.user.id).voiceChannel
        .guild.id
    );

    if (!player)
      return socket.emit(
        'playerError',
        'Cant remove track, there is no player!'
      );

    if (
      (!data && data !== 0) ||
      player.queue.size === 0 ||
      data < 0 ||
      data > player.queue.size
    )
      return socket.emit('playerError', `Corrupted track index: ${data}`);
    player.queue.remove(data);
    await getPlayer(client, socket);
  }
};

export default PauseEvent;
