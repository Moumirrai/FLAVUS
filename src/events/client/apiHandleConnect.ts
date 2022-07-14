import {
  TextChannel,
  VoiceState,
  Permissions,
  VoiceBasedChannel,
  VoiceChannel
} from 'discord.js';
import { iEvent, iVoiceCache } from 'flavus';
import { Socket } from 'socket.io';
import { getPlayer } from '../../API/player';

//TODO: Fix this mess!!!!!!!!!!!!!!!!!!

const VoiceStateUpdateEvent: iEvent = {
  name: 'apiHandleConnect',
  async execute(client, payload: VoiceState | Socket) {
    let isVoice = false
    let isSokcet = false
    if (payload instanceof VoiceState) {
      isVoice = true
      client.logger.debug(`apiHandleConnect: voiceState - ${payload.member.user.username}`); //DEBUG
      client.APICache.voice.set(payload.member.id, {
        voiceChannel: payload.channel as VoiceChannel,
        user: payload.member.user,
        guildId: payload.guild.id,
        deafened: payload.member.voice.deaf || payload.member.voice.selfDeaf
      });
    } else if (payload instanceof Socket) {
      isSokcet = true
      client.logger.debug(`apiHandleConnect: socket - ${payload.request.session.user.username}`); //DEBUG
      client.APICache.socket.set(payload.request.session.user.id, payload);
    } else
      return client.logger.error(
        'VoiceStateUpdateEvent: payload is not a VoiceState or Socket'
      );
    //#############################################################################################
    if (isVoice) {
      let socket = client.APICache.socket.get((payload as VoiceState).member.id)
      let player = client.manager.players.get((payload as VoiceState).guild.id)
      if (socket && player) {
        if (!socket.interval) {
          socket.interval = setInterval(() => getPlayer(client, socket), 1000);
        }
      } else if (socket) {
        getPlayer(client, socket)
      }
    } else if (isSokcet) {
      let voiceState = client.APICache.voice.get((payload as Socket).request.session.user.id)
      if (voiceState) {
        // return
      }
    }
  }
};

export default VoiceStateUpdateEvent;
