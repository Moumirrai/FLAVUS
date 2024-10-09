import { Player, Track, TrackExceptionEvent } from 'magmastream';
import { iManagerEvent } from 'flavus';
import { TextBasedChannel, TextChannel, DMChannel, NewsChannel } from 'discord.js';

const isTextChannel = (channel: TextBasedChannel): channel is TextChannel => {
  return (channel as TextChannel).send !== undefined;
};

const isDMChannel = (channel: TextBasedChannel): channel is DMChannel => {
  return (channel as DMChannel).recipient !== undefined;
};

const isNewsChannel = (channel: TextBasedChannel): channel is NewsChannel => {
  return (channel as NewsChannel).nsfw !== undefined;
};

const trackStartEvent: iManagerEvent = {
  name: 'trackError',
  execute(client, _manager, player: Player, track: Track, payload: TrackExceptionEvent) {
    console.log(payload)
    client.logger.error(`***\nTrack error: ${payload.exception}\n${track.title}\n***`);
    
    const channel = client.channels.cache.get(player.textChannel) as TextBasedChannel;
    
    if (channel && (isTextChannel(channel) || isDMChannel(channel) || isNewsChannel(channel))) {
      client.embeds.message.error(
        channel,
        {
          title: 'Track failed to load!',
          description: `\`\`\`scala\n${track.title} failed to load\`\`\``
        }
      );
    } else {
      client.logger.error('Failed to send error message: Invalid channel type.');
    }
    
    player.destroy();
  }
};

export default trackStartEvent;