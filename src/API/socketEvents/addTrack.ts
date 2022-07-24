import { SocketEvent } from 'flavus-api';
import { Player, SearchResult } from 'erela.js';
import { Connect } from '../APIFunctions';

const PauseEvent: SocketEvent = {
  name: 'addTrack',
  rateLimit: {
    points: 5,
    duration: 1
  },
  async execute(client, socket, data: string): Promise<any> {
    if (!data) return socket.emit('playerError', 'Track is corrupted!');
    const voiceCache = client.APICache.voice.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('playerError', "I can't see you connected!");

    const player: Player =
      client.manager.players.get(
        client.APICache.voice.get(socket.request.session.user.id).voiceChannel
          .guild.id
      ) || (await Connect(client, socket.request.session));

    if (!player)
      return socket.emit('playerError', 'Cant add song, there is no player!');
    let res = await client.PlayerManager.search(
      data,
      player,
      voiceCache.user
    ).catch((err) => {
      return socket.emit('playerError', err.message.message);
    });
    if (!res) return socket.emit('playerError', 'Track is corrupted!');
    await client.PlayerManager.handleSearchResult(
      client,
      res as SearchResult,
      player,
      true
    )
      .then((reply) => {
        return socket.emit('trackAdded', reply);
      })
      .catch((err) => {
        return socket.emit('playerError', err);
      });
  }
};

export default PauseEvent;
