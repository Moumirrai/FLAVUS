import { Player } from 'erela.js';
import { iManagerEvent } from 'flavus';

const queueEndEvent: iManagerEvent = {
  name: 'queueEnd',
  async execute(client, _manager, player: Player) {
    /*
    TODO: add option to send "end of queue, starting autoplay" embed
    - check against database now, and if disabled send end embed
    await client.functions.autoplay(client, player);
    */
    await client.PlayerManager.autoplay(client, player);
  }
};

export default queueEndEvent;
