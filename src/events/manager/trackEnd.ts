import { Player } from 'erela.js';
import { iManagerEvent } from 'flavus';

const trackEndEvent: iManagerEvent = {
  name: 'trackEnd',
  async execute(client, _manager, player: Player) {
    if (!player || !player.queue) return;
    if (player.queue.current) {
      if (player.queue.current.startTime) {
        await player.play(player.queue.current, {
          startTime: player.queue.current.startTime
            ? player.queue.current.startTime
            : 0
        });
      } else {
        await player.play();
      }
    }
  }
};

export default trackEndEvent;
