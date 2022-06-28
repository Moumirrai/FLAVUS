import { SocketEvent } from 'flavus-api';
import {
  Player,
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
  async execute(client, socket, data: IUnresolvedTrack): Promise<any> {
    if (!data || !data.author || !data.duration || !data.title)
      return socket.emit('playerError', 'Track is corrupted!');
    const resolved = TrackUtils.buildUnresolved(
      {
        title: data.title,
        author: data.author,
        duration: data.duration
      },
      socket.request.session.user
    );
    if (!resolved) return socket.emit('playerError', 'Track is corrupted!');

    const voiceCache = client.voiceCache.get(socket.request.session.user.id);
    if (!voiceCache)
      return socket.emit('playerError', "I can't see you connected!");

    const player: Player =
      client.manager.players.get(
        client.voiceCache.get(socket.request.session.user.id).voiceChannel.guild
          .id
      ) || (await Connect(client, socket.request.session));

    if (!player)
      return socket.emit('playerError', 'Cant add song, there is no player!');

    if (player.state !== 'CONNECTED') {
      player.set('playerauthor', socket.request.session.user.id);
      player.connect();
      player.queue.add(resolved);
      socket.emit('trackAdded', resolved.title);
      player.play();
      player.pause(false);
    } else if (!player.queue || !player.queue.current) {
      player.queue.add(resolved);
      socket.emit('trackAdded', resolved.title);
      if (!player.playing && !player.paused && !player.queue.size)
        player.play();
      player.pause(false);
    } else {
      player.queue.add(resolved);
      socket.emit('trackAdded', resolved.title);
    }
  }
};

export default PauseEvent;
