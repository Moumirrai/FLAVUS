import { SocketEvent } from 'flavus-api';
import type { Player } from 'erela.js';
import { getPlayer } from '../player';

const SeekEvent: SocketEvent = {
  name: 'seek',
  async execute(client, socket, data: number): Promise<any> {

    const voiceCache = client.voiceCache.get(socket.request.session.user.id)
    if (!voiceCache) return socket.emit('playerError', 'I can\'t see you connected!')
    const player: Player = client.manager.players.get(
      voiceCache.voiceChannel.guild.id
    )
    if (!player || !player.queue.current) return socket.emit('playerError', 'Nothing to seek!')
    if (typeof data !== "number") return socket.emit('playerError', 'Seek data must be a number!')
    if (data < 0 || data > player.queue.current.duration) return socket.emit('playerError', 'Seek is limited by track duration!')
    player.seek(data);
    getPlayer(client, socket)
  }
};

export default SeekEvent;
