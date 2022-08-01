import { Track } from 'erela.js';
import { Player } from 'erela.js';
import { iManagerEvent } from 'flavus';
import { MessageEmbed, TextChannel } from 'discord.js';

const trackStuckEvent: iManagerEvent = {
  name: 'trackStuck',
  async execute(client, _manager, player: Player, track: Track, payload: any) {
    client.logger.error(`Track stuck: ${track.uri}\n` + payload.toString());
    return (client.channels.cache.get(player.textChannel) as TextChannel)
      .send(client.embeds.error('Track failed to load!', `\`\`\`scala\n${track.title} failed to load within ${payload.thresholdMs ? payload.thresholdMs : 10000} ms\`\`\``))
      .catch(() => {});
  }
};

export default trackStuckEvent;
