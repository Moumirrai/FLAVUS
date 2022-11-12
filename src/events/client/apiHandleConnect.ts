import { VoiceState, VoiceChannel } from 'discord.js';
import { iEvent, iVoiceCache } from 'flavus';
import { Socket } from 'socket.io';
import { getPlayer } from '../../API/player';

//TODO: Fix this mess!!!!!!!!!!!!!!!!!!

const VoiceStateUpdateEvent: iEvent = {
  name: 'apiHandleConnect',
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
      client.apiClient.cache.voiceStates.set(payload.member.id, {
        voiceChannel: payload.channel as VoiceChannel,
        user: payload.member.user,
        guildId: payload.guild.id,
        deafened: payload.member.voice.deaf || payload.member.voice.selfDeaf
      });
    } else if (payload instanceof Socket) {
      isSokcet = true;
      /*
      client.logger.debug(
        `apiHandleConnect: socket - ${payload.request.session.user.username}`
      ); //DEBUG
      */
      client.apiClient.cache.sockets.set(
        payload.request.session.user.id,
        payload
      );

    } else
      return client.logger.error(
        'VoiceStateUpdateEvent: payload is not a VoiceState or Socket'
      );
    //#############################################################################################
    if (isVoice) {
      let socket = client.apiClient.cache.sockets.get(
        (payload as VoiceState).member.id
      );
      //let player = client.manager.players.get((payload as VoiceState).guild.id);
      if (socket /* && player*/) {
        client.apiClient.roomManager.join(socket, (payload as VoiceState).guild.id);
        if (!socket.interval) {
          socket.interval = setInterval(() => getPlayer(client, socket), 1000);
        }
      } /* else if (socket) {
        getPlayer(client, socket);
      }*/
    } else if (isSokcet) {
      let voiceState = client.apiClient.cache.voiceStates.get(
        (payload as Socket).request.session.user.id
      );
      if (voiceState) {
        let socket = payload as Socket;
        //check if there is any socket room with the same guild id, if not create one and join it
        client.apiClient.roomManager.join(socket, voiceState.guildId);
        if (!socket.interval) {
          // client.logger.debug('creating interval');
          socket.interval = setInterval(() => getPlayer(client, socket), 1000);
        }
      }
    }
  }
};

export default VoiceStateUpdateEvent;
