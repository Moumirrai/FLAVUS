import { SocketEvent } from 'flavus-api';
import {
  Player,
  SearchResult,
  Track,
  TrackUtils,
  UnresolvedQuery,
  UnresolvedTrack
} from 'erela.js';
import { Connect } from '../APIFunctions';

interface IUnresolvedTrack {
  title: string;
  author: string;
  duration: number;
}

const PauseEvent: SocketEvent = {
  name: 'addTrack',
  rateLimit: {
    points: 5,
    duration: 1
  },
  async execute(client, socket, data: string): Promise<any> {
    client.logger.debug(data)
    if (!data) return socket.emit('playerError', 'Track is corrupted!');

    console.log(data)

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

    let search = await client.PlayerManager.search(
      data,
      player,
      client.config.anonymous ? voiceCache.user : client.user
    ).catch((err) => {
      return socket.emit('playerError', err.message);
    });
    if (!search) return socket.emit('playerError', 'Track is corrupted!');
    if ((search as SearchResult).loadType !== 'TRACK_LOADED')
      return socket.emit('playerError', 'Track is corrupted!');

    if (player.state !== 'CONNECTED') {
      player.set('playerauthor', socket.request.session.user.id);
      player.connect();
      player.queue.add((search as SearchResult).tracks[0]);
      socket.emit('trackAdded', (search as SearchResult).tracks[0].title);
      player.play();
      player.pause(false);
    } else if (!player.queue || !player.queue.current) {
      player.queue.add((search as SearchResult).tracks[0]);
      socket.emit('trackAdded', (search as SearchResult).tracks[0].title);
      if (!player.playing && !player.paused && !player.queue.size)
        player.play();
      player.pause(false);
    } else {
      player.queue.add((search as SearchResult).tracks[0]);
      socket.emit('trackAdded', (search as SearchResult).tracks[0].title);
    }
  }
};

export default PauseEvent;
