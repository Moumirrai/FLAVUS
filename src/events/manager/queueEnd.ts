import { Player } from 'erela.js';
import { MessageEmbed, TextChannel } from 'discord.js';
import { iManagerEvent } from 'flavus';
import { GuildModel } from '../../models/guildModel';

const queueEndEvent: iManagerEvent = {
  name: 'queueEnd',
  async execute(client, _manager, player: Player) {
    let guildModel = await GuildModel.findOne({
      guildID: player.guild
    });
    if (!guildModel || !guildModel.autoplay.active) {
      player.destroy();
      return (client.channels.cache.get(player.textChannel) as TextChannel)
        .send({
          embeds: [
            new MessageEmbed()
              .setColor(client.config.embed.color)
              .setTitle('Queue has ended')
              .setDescription('You can enable autoplay with `autoplay` command')
          ]
        })
        .catch((e) => {
          client.logger.error(e);
        });
    }
    await client.PlayerManager.autoplay(client, player, guildModel.autoplay.mode);
  }
};

export default queueEndEvent;
