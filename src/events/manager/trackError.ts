import { Player, Track, TrackExceptionEvent } from 'erela.js';
import { iManagerEvent } from 'flavus';
import { TextBasedChannel } from 'discord.js';

const trackStartEvent: iManagerEvent = {
  name: 'trackError',
  execute(client, _manager, player: Player, track: Track, payload: TrackExceptionEvent) {
    client.logger.error(`***\nTrack error: ${payload.error}\n${track.title}\n***`);
    client.embeds.message.error(
      client.channels.cache.get(player.textChannel) as TextBasedChannel,
      {
        title: 'Track failed to load!',
        description: `\`\`\`scala\n${track.title} failed to load\`\`\``
      }
    );
    player.destroy();
  }
};

export default trackStartEvent;
