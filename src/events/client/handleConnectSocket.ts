import { iEvent } from 'flavus';
import { Socket } from 'socket.io';

const VoiceStateUpdateEvent: iEvent = {
  name: 'handleConnectSocket',
  async execute(client, socket: Socket) {
    client.apiClient.cache.sockets.set(
      socket.request.session.user.id,
      socket
    );
    const voiceState = client.apiClient.cache.voiceStates.get(
      socket.request.session.user.id
    );
    if (voiceState) {
      //check if there is any socket room with the same guild id, if not create one and join it
      console.log('connectSocket calling join')
      await client.apiClient.roomManager.join(socket, voiceState.guildId);
    }
  }
};

export default VoiceStateUpdateEvent;
