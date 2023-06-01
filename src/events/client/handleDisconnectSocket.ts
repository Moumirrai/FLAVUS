import { iEvent } from 'flavus';
import { Socket } from 'socket.io';

/**
 * Handle disconnect socket event
 * If possible, it will remove the socket from the cache and leave the room
 */

const handleDisconnectSocketEvent: iEvent = {
  name: 'handleDisconnectSocket',
  async execute(client, socket: Socket) {
    const cache: Socket = client.apiClient.cache.sockets.get(
      socket.request.session.user.id
    );
    if (cache) {
      client.apiClient.cache.sockets.delete(socket.request.session.user.id);
    }
    await client.apiClient.roomManager.leave(socket);
  }
};

export default handleDisconnectSocketEvent;
