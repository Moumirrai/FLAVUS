import { Player } from 'erela.js';
import { iManagerEvent } from 'my-module';

const queueEndEvent: iManagerEvent = {
  name: 'queueEnd',
  async execute(client, _manager, player: Player) {
    client.functions.autoplay(client, player);
  }
};

export default queueEndEvent;
