import { SocketEvent } from 'flavus-api';
import type { Player } from 'magmastream';

const StopEvent: SocketEvent = {
  name: 'player:stop',
  rateLimit: {
    points: 1,
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
    if (!player) return socket.emit('player:error', 'Nothing to stop!');
    client.logger.log('Stopping player, code 101');
    player.destroy();
    //await getPlayer(client, socket);
  }
};

export default StopEvent;
