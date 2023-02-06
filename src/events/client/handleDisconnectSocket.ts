import { iEvent } from 'flavus';
import { Socket } from 'socket.io';

const handleDisconnectSocketEvent: iEvent = {
  name: 'handleDisconnectSocket',
  async execute(client, socket: Socket) {
    let cache = client.apiClient.cache.sockets.get(
      socket.request.session.user.id
    );
    if (cache) {
      client.apiClient.cache.sockets.delete(socket.request.session.user.id);
    }
    await client.apiClient.roomManager.leave(socket);
  }
};

export default handleDisconnectSocketEvent;
