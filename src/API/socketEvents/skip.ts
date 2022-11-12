import { SocketEvent } from 'flavus-api';
import type { Player } from 'erela.js';
import { getPlayer } from '../player';

const SkipEvent: SocketEvent = {
  name: 'skip',
  rateLimit: {
    points: 1,
    duration: 1
  },
  async execute(client, socket, data: number): Promise<any> {
    const voiceCache = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('playerError', "I can't see you connected!");
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    );
    if (!player || !player.queue.current)
      return socket.emit('playerError', 'There is nothing playing!');
    player.stop();
    await getPlayer(client, socket);
  }
};

export default SkipEvent;
