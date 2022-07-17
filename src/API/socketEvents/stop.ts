import { SocketEvent } from 'flavus-api';
import type { Player } from 'erela.js';
import { getPlayer } from '../player';

//TODO: fix or delete

const StopEvent: SocketEvent = {
  name: 'stop',
  rateLimit: {
    points: 1,
    duration: 1
  },
  async execute(client, socket, data: boolean): Promise<any> {
    const voiceCache = client.APICache.voice.get(
      socket.request.session.user.id
    );
    if (!voiceCache)
      return socket.emit('playerError', "I can't see you connected!");
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    );
    if (!player) return socket.emit('playerError', 'Nothing to stop!');
    player.destroy();
    getPlayer(client, socket);
  }
};

export default StopEvent;
