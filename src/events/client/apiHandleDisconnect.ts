import { VoiceState } from 'discord.js';
import { iEvent } from 'flavus';
import { Socket } from 'socket.io';

//TODO: Fix this mess!!!!!!!!!!!!!!!!!!

const VoiceStateUpdateEvent: iEvent = {
  name: 'apiHandleDisconnect',
  async execute(client, payload: VoiceState | Socket) {
    let isVoice = false;
    let isSokcet = false;
    if (payload instanceof VoiceState) {
      isVoice = true;
      /*
      client.logger.debug(
        `apiHandleConnect: voiceState - ${payload.member.user.username}`
      ); //DEBUG
      */
      client.apiClient.cache.voiceStates.delete(payload.member.id);
    } else if (payload instanceof Socket) {
      isSokcet = true;
      client.apiClient.cache.sockets.delete(payload.request.session.user.id);
    } else
      return client.logger.error(
        'VoiceStateUpdateEvent: payload is not a VoiceState or Socket'
      );
    if (isVoice) {
      const socket = client.apiClient.cache.sockets.get(
        (payload as VoiceState).member.id
      );
      if (socket && socket.interval) {
        clearInterval(socket.interval);
        socket.interval = undefined;
      }
      client.apiClient.roomManager.leave(socket)
    } else if (isSokcet) {
      const socket = payload as Socket;
      if (socket.interval) {
        clearInterval(socket.interval);
        socket.interval = undefined;
      }
      client.apiClient.roomManager.leave(socket)
    }
  }
};

export default VoiceStateUpdateEvent;
