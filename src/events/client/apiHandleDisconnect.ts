import {
  TextChannel,
  VoiceState,
  Permissions,
  VoiceBasedChannel,
  VoiceChannel
} from 'discord.js';
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
      client.logger.debug(
        `apiHandleConnect: voiceState - ${payload.member.user.username}`
      ); //DEBUG
      client.APICache.voice.delete(payload.member.id);
    } else if (payload instanceof Socket) {
      isSokcet = true;
      client.APICache.socket.delete(payload.request.session.user.id);
    } else
      return client.logger.error(
        'VoiceStateUpdateEvent: payload is not a VoiceState or Socket'
    );
    if (isVoice) {
      let socket = client.APICache.socket.get(
        (payload as VoiceState).member.id
      );
      if (socket && socket.interval) {
        clearInterval(socket.interval);
        socket.interval = undefined;
      }
    } else if (isSokcet) {
      let socket = (payload as Socket)
      if (socket.interval) {
        clearInterval(socket.interval);
        socket.interval = undefined;
      }
    }
  }
};

export default VoiceStateUpdateEvent;
