import { Player } from 'erela.js';
import { MessageEmbed, TextChannel } from 'discord.js';
import { iManagerEvent } from 'flavus';

const queueEndEvent: iManagerEvent = {
  name: 'queueEnd',
  async execute(client, _manager, player: Player) {
    const guildModel = await client.functions.fetchGuildConfig(player.guild);
    if (!guildModel || !guildModel.autoplay.active) {
      client.logger.log('Stopping player, code 105');
      player.destroy();
      client.emit('queueUpdate', player)
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
    //console.log("error:skip:1");
    await client.PlayerManager.autoplay(client, player, guildModel.autoplay.mode);
    client.emit('queueUpdate', player)
  }
};

export default queueEndEvent;
