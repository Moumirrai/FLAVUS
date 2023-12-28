import { SocketEvent } from 'flavus-api';
import type { Player } from 'magmastream';

const StopEvent: SocketEvent = {
  name: 'player:clearQueue',
  rateLimit: {
    points: 1,
    duration: 1
  },
  async execute(client, socket): Promise<boolean> {
    const voiceCache = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('player:error', "I can't see you connected!");
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    );
    if (!player) return socket.emit('player:error', 'Nothing to stop!');
    if (!player.queue.size)
      return socket.emit('player:error', 'Queue is empty!');
    player.queue.clear();
    client.emit('queueUpdate', player);
  }
};

export default StopEvent;
