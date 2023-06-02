import { Player, Track, TrackExceptionEvent } from 'erela.js';
import { iManagerEvent } from 'flavus';

const trackStartEvent: iManagerEvent = {
  name: 'trackError',
  execute(client, _manager, player: Player, track: Track, payload: TrackExceptionEvent) {
    client.logger.error(`***\nTrack error: ${payload.error}\n${track.title}\n***`);
  }
};

export default trackStartEvent;
