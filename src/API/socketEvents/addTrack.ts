import { ResultHandlerInterface, SocketEvent } from 'flavus-api';
import { Player, SearchResult, SearchQuery } from 'erela.js';
import { Connect } from '../client/APIFunctions';
import validUrl from 'valid-url';

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
    if (!voiceCache) {
      return socket.emit('player:error', "I can't see you connected!");
    }

    const player: Player =
      client.manager.players.get(voiceCache.voiceChannel.guild.id) ||
      (await Connect(client, socket.request.session));

    if (!player)
      return socket.emit('player:error', 'Cant add song, there is no player!');

    const searchQuery = validUrl.isUri(data)
      ? data
      : { source: 'youtube', query: data };
    const author = socket.request.session.user;
    try {
      const res = await player.search(searchQuery, author);
      if (!res) return socket.emit('player:error', 'Track is corrupted!');
      const reply = await client.PlayerManager.handleSearchResult(
        res as SearchResult,
        player,
        true
      );
      return socket.emit('player:trackAdded', reply as ResultHandlerInterface);
    } catch (err) {
      client.logger.error(err);
      return socket.emit('player:error', err.message);
    }
  }
};

export default PauseEvent;
