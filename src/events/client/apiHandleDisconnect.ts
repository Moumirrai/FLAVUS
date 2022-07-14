import {
  TextChannel,
  VoiceState,
  Permissions,
  VoiceBasedChannel,
  VoiceChannel
} from 'discord.js';
import { iEvent } from 'flavus';

//TODO: Fix this mess!!!!!!!!!!!!!!!!!!

const VoiceStateUpdateEvent: iEvent = {
  name: 'apiHandleDisconnect',
  async execute(client, newState) {
    console.log('apiHandleDisconnect');
  }
};

export default VoiceStateUpdateEvent;
