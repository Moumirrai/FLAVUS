import { Player, TrackStuckEvent, Track } from 'erela.js';
import { iManagerEvent } from 'flavus';
import { TextChannel } from 'discord.js';

const trackStuckEvent: iManagerEvent = {
  name: 'trackStuck',
  async execute(
    client,
    _manager,
    player: Player,
    track: Track,
    payload: TrackStuckEvent
  ) {
    client.logger.error(`Track stuck: ${track.uri}\n` + payload.toString());
    return client.embeds.error(
      client.channels.cache.get(player.textChannel) as TextChannel,
      {
        title: 'Track failed to load!',
        description: `\`\`\`scala\n${track.title} failed to load within ${
          payload.thresholdMs ? payload.thresholdMs : 10000
        } ms\`\`\``
      }
    );
  }
};

export default trackStuckEvent;
