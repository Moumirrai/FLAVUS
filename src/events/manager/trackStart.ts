import { Player } from 'erela.js';
import { iManagerEvent } from 'my-module';

const trackStartEvent: iManagerEvent = {
  name: 'trackStart',
  async execute(client, _manager, player: Player) {
    player.set(`previousTrack`, player.queue.current);
  }
};

export default trackStartEvent;
