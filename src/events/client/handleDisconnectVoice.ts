import { VoiceState } from 'discord.js';
import { iEvent } from 'flavus';

const handleDisconnectVoiceEvent: iEvent = {
  name: 'handleDisconnectVoice',
  async execute(client, voiceState: VoiceState) {

    client.apiClient.cache.voiceStates.delete(voiceState.member.id);
    const socket = client.apiClient.cache.sockets.get(voiceState.member.id);
    await client.apiClient.roomManager.leave(socket);
  }
};

export default handleDisconnectVoiceEvent;
