import { VoiceState, VoiceChannel } from 'discord.js';
import { iEvent } from 'flavus';

const handleConnectVoiceEvent: iEvent = {
  name: 'handleConnectVoice',
  async execute(client, payload: VoiceState) {
    client.apiClient.cache.voiceStates.set(payload.member.id, {
      voiceChannel: payload.channel as VoiceChannel,
      user: payload.member.user,
      guildId: payload.guild.id,
      deafened: payload.member.voice.deaf || payload.member.voice.selfDeaf
    });
    const socket = client.apiClient.cache.sockets.get(payload.member.id);
    if (socket) {
      console.log('connectVoice calling join')
      await client.apiClient.roomManager.join(
        socket,
        payload.guild.id
      );
    }
  }
};

export default handleConnectVoiceEvent;
