import { Player } from 'erela.js';
import { iManagerEvent } from 'my-module';

const trackEndEvent: iManagerEvent = {
  name: 'trackStart',
  async execute(client, _manager, player: Player) {
    if (player.get('pauseOnEnd')) {
      player.set('pauseOnEnd', false);
      if (!player || !player.playing) return
      player.pause(true);
    }
    player.set(`previousTrack`, player.queue.current);
  }
};

export default trackEndEvent;
