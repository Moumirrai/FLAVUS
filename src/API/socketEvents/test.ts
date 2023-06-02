import { SocketEvent } from 'flavus-api';

//TODO: delete

const DebugEvent: SocketEvent = {
  name: 'test',
  rateLimit: {
    points: 1,
    duration: 1
  },
  execute(client, socket, data): void {
    console.log(socket.request.session.user.id);
    console.log(socket.rooms);
    console.log(socket.rooms.size);
    client.logger.debug('Test socket event - ' + data);
  }
};

export default DebugEvent;
