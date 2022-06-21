import { SocketEvent } from 'flavus-api';
import type { Player } from 'erela.js';
import { getPlayer } from '../player';

//TODO: fix or delete

const PauseEvent: SocketEvent = {
  name: 'pause',
  async execute(client, socket, data: boolean): Promise<any> {
    const voiceCache = client.voiceCache.get(socket.request.session.user.id)
    if (!voiceCache) return socket.emit('playerError', 'I can\'t see you connected!')
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    )
    if (!player || !player.queue.current) return socket.emit('playerError', 'Nothing to pause!')
    if (typeof data !== 'boolean') return socket.emit('playerError', 'Pause data must be boolean!')
    player.pause(data);
    getPlayer(client, socket)
  }
};

export default PauseEvent;
