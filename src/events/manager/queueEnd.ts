import { Player } from 'erela.js';
import { iManagerEvent } from 'flavus';

const queueEndEvent: iManagerEvent = {
  name: 'queueEnd',
  async execute(client, _manager, player: Player) {
    client.functions.autoplay(client, player);
  }
};

export default queueEndEvent;
