import { Player } from 'erela.js';
import { iManagerEvent } from 'flavus';

const trackStartEvent: iManagerEvent = {
  name: 'trackStart',
  async execute(client, _manager, player: Player) {
    player.set(`previousTrack`, player.queue.current);
    if (player.get('pauseOnEnd')) {
      player.set('pauseOnEnd', false);
      if (!player || !player.playing) return
      player.pause(true);
    }
  }
};

export default trackStartEvent;
