import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle
} from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Queue: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Shows queue and current track progress'),

  requirements: {
    playerRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    const rowBuilder = (leftDisabled: boolean, rightDisabled: boolean) =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('id_1')
          .setEmoji('⬅️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(leftDisabled),
        new ButtonBuilder()
          .setCustomId('id_2')
          .setEmoji('➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(rightDisabled)
      );

    let row = rowBuilder(true, false);
    const message = await interaction.reply({
      embeds: [core.functions.createQueueEmbed(player, 0, core)],
      components: player.queue.length <= 15 ? [] : [row],
      fetchReply: true
    });
    if (player.queue.length <= 15) return;
    let currentIndex = 0;
    const collector = interaction.channel.createMessageComponentCollector({
      time: 120000
    });
    collector.on('collect', async (button) => {
      const maxIndex = Math.ceil(player.queue.length / 15) * 15 - 15;
      if (button.message.id !== message.id) return;
      collector.resetTimer();
      player = core.manager.players.get(interaction.guild.id);
      if (!player) {
        await button.deferUpdate();
        await message.edit({
          embeds: [
            new EmbedBuilder()
              .setColor(core.config.embed.color)
              .setTitle('There is no player!')
          ],
          components: []
        });
        return collector.stop();
      }
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
          embeds: [core.functions.createQueueEmbed(player, currentIndex, core)],
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
          embeds: [core.functions.createQueueEmbed(player, currentIndex, core)],
          components: [row]
        });
        await button.deferUpdate();
      }
    });

    collector.on('end', async () => {
      await message.edit({
        embeds: [core.functions.createQueueEmbed(player, 0, core)],
        components: []
      });
    });
  }
};

export default Queue;
