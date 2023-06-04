import { ResultHandlerInterface, SocketEvent } from 'flavus-api';
import { Player, SearchResult } from 'erela.js';
import { Connect } from '../client/APIFunctions';

const PauseEvent: SocketEvent = {
  name: 'player:addTrack',
  rateLimit: {
    points: 5,
    duration: 1
  },
  async execute(client, socket, data: string): Promise<boolean> {
    if (!data) return socket.emit('player:error', 'Track is corrupted!');
    const voiceCache = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('player:error', "I can't see you connected!");

    const player: Player =
      client.manager.players.get(
        client.apiClient.cache.voiceStates.get(socket.request.session.user.id)
          .voiceChannel.guild.id
      ) || (await Connect(client, socket.request.session));

    if (!player)
      return socket.emit('player:error', 'Cant add song, there is no player!');
    const res = await client.PlayerManager.search(
      data,
      player,
      voiceCache.user
    ).catch((err) => {
      return socket.emit('player:error', err.message.message);
    });
    if (!res) return socket.emit('player:error', 'Track is corrupted!');
    await client.PlayerManager.handleSearchResult(
      client,
      res as SearchResult,
      player,
      true
    )
      .then((reply: ResultHandlerInterface) => {
        return socket.emit('player:trackAdded', reply);
      })
      .catch((err) => {
        return socket.emit('player:error', err);
      });
  }
};

export default PauseEvent;
