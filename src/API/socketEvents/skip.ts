import { SocketEvent } from 'flavus-api';
import type { Player } from 'erela.js';

const SkipEvent: SocketEvent = {
  name: 'player:skip',
  rateLimit: {
    points: 1,
    duration: 1
  },
  async execute(client, socket, /*data: number*/): Promise<boolean> {
    const voiceCache = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('player:error', "I can't see you connected!");
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    );
    if (!player || !player.queue.current)
      return socket.emit('player:error', 'There is nothing playing!');
    console.log("playerstop")
    player.stop();
    //await getPlayer(client, socket);
  }
};

export default SkipEvent;
