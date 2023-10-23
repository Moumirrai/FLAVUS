import { SocketEvent } from 'flavus-api';
import type { Player } from 'erela.js';

const PauseEvent: SocketEvent = {
  name: 'player:queueRefresh',
  rateLimit: {
    points: 5,
    duration: 1
  },
  execute(client, socket): boolean {
    const voiceCache = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('player:error', "I can't see you connected!");
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    );
    if (!player) return socket.emit('player:error', 'Error fetching queue!');
    client.emit('queueUpdate', player);
  }
};

export default PauseEvent;
