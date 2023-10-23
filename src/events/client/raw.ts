import { iEvent } from 'flavus';
import { Events } from 'discord.js'

const RawEvent: iEvent = {
  name: Events.Raw,
  execute(client, d) {
    client.manager.updateVoiceState(d);
  }
};

export default RawEvent;
