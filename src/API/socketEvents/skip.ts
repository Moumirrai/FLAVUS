import { SocketEvent } from 'flavus-api';
import type { Player } from 'erela.js';
import { getPlayer } from '../player';

const SkipEvent: SocketEvent = {
  name: 'skip',
  async execute(client, socket, data: number): Promise<any> {
    const voiceCache = client.voiceCache.get(socket.request.session.user.id);
    if (!voiceCache)
      return socket.emit('playerError', "I can't see you connected!");
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    );
    if (!player || !player.queue.current)
      return socket.emit('playerError', 'There is nothing playing!');
    player.stop();
    getPlayer(client, socket);
  }
};

export default SkipEvent;
