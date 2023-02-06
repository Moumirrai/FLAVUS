import { Player, Track } from 'erela.js';
import { iManagerEvent } from 'flavus';

const trackEndEvent: iManagerEvent = {
  name: 'trackEnd',
  async execute(client, _manager, player: Player, track: Track) {
    if (!player || !player.queue) return;
    console.log(track.title)
    if (player.queue.current) {
      player.queue.history.push(player.queue.current);
      if (player.queue.current.startTime) {
        await player.play(player.queue.current, {
          startTime: player.queue.current.startTime
            ? player.queue.current.startTime
            : 0
        });
        client.emit('queueUpdate', player);
      } else {
        await player.play();
        client.emit('queueUpdate', player);
      }
    }
  }
};

export default trackEndEvent;
