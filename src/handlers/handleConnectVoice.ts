import { VoiceState, VoiceChannel } from 'discord.js';

async function handleConnectVoiceEvent(client, payload: VoiceState) {
  console.log('handleConnectVoiceEvent')
  client.apiClient.cache.voiceStates.set(payload.member.id, {
    voiceChannel: payload.channel as VoiceChannel,
    user: payload.member.user,
    guildId: payload.guild.id,
    deafened: payload.member.voice.deaf || payload.member.voice.selfDeaf
  });
  const socket = client.apiClient.cache.sockets.get(payload.member.id);
  if (socket) {
    await client.apiClient.roomManager.join(socket, payload.guild.id);
  }
}

export default handleConnectVoiceEvent;
