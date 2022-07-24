import { SocketEvent } from 'flavus-api';

//TODO: delete

const DebugEvent: SocketEvent = {
  name: 'test',
  rateLimit: {
    points: 1,
    duration: 1
  },
  async execute(client, socket, data): Promise<any> {
    console.log(socket.request.session.user.id);
    client.logger.debug('Test socket event - ' + data);
  }
};

export default DebugEvent;
