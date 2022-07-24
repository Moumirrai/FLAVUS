import { SocketEvent } from 'flavus-api';
import type { Player } from 'erela.js';
import { getPlayer } from '../player';

const PauseEvent: SocketEvent = {
  name: 'pause',
  rateLimit: {
    points: 5,
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
    if (!player || !player.queue.current)
      return socket.emit('playerError', 'Nothing to pause!');
    if (typeof data !== 'boolean')
      return socket.emit('playerError', 'Pause data must be boolean!');
    player.pause(data);
    await getPlayer(client, socket);
  }
};

export default PauseEvent;
