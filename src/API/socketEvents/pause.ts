import { SocketEvent } from 'flavus-api';
import type { Player } from 'erela.js';

const PauseEvent: SocketEvent = {
  name: 'player:pause',
  rateLimit: {
    points: 5,
    duration: 1
  },
  async execute(client, socket, data: boolean): Promise<boolean> {
    const voiceCache = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('player:error', "I can't see you connected!");
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    );
    if (!player || !player.queue.current)
      return socket.emit('player:error', 'Nothing to pause!');
    if (typeof data !== 'boolean')
      return socket.emit('player:error', 'Pause data must be boolean!');
    player.pause(data);
    //await getPlayer(client, socket);
  }
};

export default PauseEvent;
