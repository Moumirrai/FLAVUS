import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js';
import { CommandArgs, iCommand } from 'my-module';

const QueueCommand: iCommand = {
  name: 'resume',
  aliases: ['q', 'np'],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: false,
  visible: true,
  description: 'Shows queue and current track progress',
  usage: '<prefix>resume',
  async execute({ client, message, player }: CommandArgs): Promise<any> {
    // create buttons;
    let row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('id_1')
        .setEmoji('⬅️')
        .setStyle('SECONDARY')
        .setDisabled(true),
      new MessageButton()
        .setCustomId('id_2')
        .setEmoji('➡️')
        .setStyle('SECONDARY')
    );
    message.channel
      .send({ embeds: [client.functions.createQueueEmbed(player, 0)] })
      .then((message) => {
        var player = client.manager.players.get(message.guild.id);
        if (player.queue.length <= 15) return;
        message.edit({
          components: [row]
        });
        const collector = message.channel.createMessageComponentCollector({
          time: 120000
        });
        let currentIndex: number = 0;
        collector.on('collect', async (button) => {
          const maxIndex = Math.ceil(player.queue.length / 15) * 15 - 15;
          if (button.message.id !== message.id) return;
          if (button.customId === 'id_1') {
            if (player.queue.length <= 15) return collector.stop();
            if (currentIndex - 15 > maxIndex) {
              currentIndex = maxIndex;
            } else {
              currentIndex -= 15;
            }
            if (currentIndex === 0) {
              row.components[0].setDisabled(true);
            }
            if (currentIndex === maxIndex) {
              row.components[1].setDisabled(true);
            } else {
              row.components[1].setDisabled(false);
            }
            await message.edit({
              embeds: [client.functions.createQueueEmbed(player, currentIndex)],
              components: [row]
            });
            await button.deferUpdate();
          } else if (button.customId === 'id_2') {
            if (maxIndex === 0) return collector.stop();
            if (currentIndex + 15 > maxIndex) {
              currentIndex = maxIndex;
            } else {
              currentIndex += 15;
            }
            if (currentIndex === maxIndex) {
              row.components[1].setDisabled(true);
            } else {
              row.components[1].setDisabled(false);
            }
            row.components[0].setDisabled(false);
            await message.edit({
              embeds: [client.functions.createQueueEmbed(player, currentIndex)],
              components: [row]
            });
            await button.deferUpdate();
          }
        });
        collector.on('end', async (button) => {
          await message.edit({
            embeds: [client.functions.createQueueEmbed(player, 0)],
            components: []
          });
        });
      });
  }
};

export default QueueCommand;
