import { SocketEvent } from 'flavus-api';
import { Player } from 'erela.js';

interface IMoveIndex {
  removedIndex: number;
  addedIndex: number;
}

const PauseEvent: SocketEvent = {
  name: 'player:moveTrack',
  rateLimit: {
    points: 5,
    duration: 1
  },
  async execute(client, socket, data: IMoveIndex): Promise<boolean> {
    if (
      !data ||
      (!data.removedIndex && data.removedIndex !== 0) ||
      (!data.addedIndex && data.addedIndex !== 0) ||
      typeof data.addedIndex !== 'number' ||
      typeof data.removedIndex !== 'number'
    )
      //if data.removedIndex is missing return error

      return socket.emit('player:error', 'Move data is corrupted!');
    const voiceCache = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('player:error', "I can't see you connected!");

    const player: Player = client.manager.players.get(
      client.apiClient.cache.voiceStates.get(socket.request.session.user.id).voiceChannel
        .guild.id
    );

    if (!player)
      return socket.emit('player:error', 'Cant move track, there is no player!');

    if (
      player.queue.size === 0 ||
      data.addedIndex < 0 ||
      data.removedIndex < 0 ||
      data.removedIndex > player.queue.size ||
      data.addedIndex > player.queue.size
    )
      return socket.emit('player:error', `Corrupted track index`);
    //remove track from queue according to removedIndex, and add it to the queue according to addedIndex
    const track = player.queue[data.removedIndex];
    player.queue.remove(data.removedIndex);
    player.queue.add(track, data.addedIndex);
    client.emit('queueUpdate', player);
    //await getPlayer(client, socket);
  }
};

export default PauseEvent;
