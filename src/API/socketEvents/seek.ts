import { SocketEvent } from 'flavus-api';
import type { Player } from 'magmastream';

const SeekEvent: SocketEvent = {
  name: 'player:seek',
  rateLimit: {
    points: 2,
    duration: 1
  },
  execute(client, socket, data: number): boolean {
    const voiceCache = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('player:error', "I can't see you connected!");
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    );
    if (!player || !player.queue.current)
      return socket.emit('player:error', 'Nothing to seek!');
    if (typeof data !== 'number')
      return socket.emit('player:error', 'Seek data must be a number!');
    if (data < 0 || data > player.queue.current.duration)
      return socket.emit('player:error', 'Seek is limited by track duration!');
    player.seek(data);
    //await getPlayer(client, socket);
  }
};

export default SeekEvent;
