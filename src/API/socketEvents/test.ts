import { SocketEvent } from 'flavus-api';

//TODO: delete

const DebugEvent: SocketEvent = {
  name: 'test',
  rateLimit: {
    points: 1,
    duration: 1
  },
  async execute(client, socket, data): Promise<void> {
    console.log(socket.request.session.user.id);
    console.log(socket.rooms);
    console.log(socket.rooms.size);
    client.logger.debug('Test socket event - ' + data);
  }
};

export default DebugEvent;
