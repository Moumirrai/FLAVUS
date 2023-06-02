import { iEvent } from 'flavus';

const RawEvent: iEvent = {
  name: 'raw',
  execute(client, d) {
    client.manager.updateVoiceState(d);
  }
};

export default RawEvent;
