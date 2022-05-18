import { Player } from 'erela.js';
import { iManagerEvent } from 'my-module';

const trackEndEvent: iManagerEvent = {
  name: 'trackEnd',
  async execute(client, _manager, player: Player) {
    if (player.get('pauseOnEnd')) {
      player.set('pauseOnEnd', false);
      if (!player || !player.playing) return
      player.pause(true);
    }
  }
};

export default trackEndEvent;
