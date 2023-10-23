import { VoiceState } from 'discord.js';

async function handleDisconnectVoiceEvent(client, voiceState: VoiceState) {
  client.apiClient.cache.voiceStates.delete(voiceState.member.id);
  const socket = client.apiClient.cache.sockets.get(voiceState.member.id);
  await client.apiClient.roomManager.leave(socket);
}

export default handleDisconnectVoiceEvent;
