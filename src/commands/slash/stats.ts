import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';
import formatDuration from 'format-duration';

const Stats: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Displays bot statistics and ping'),
  execute: async ({ interaction, core }) => {
    const reply = await interaction.reply({
      content: 'Measuring ping...',
      fetchReply: true
    });
    if (!reply) return;
    await interaction.editReply({
      content: '',
      embeds: [
        new EmbedBuilder()
          .setColor(core.config.embed.color)
          .setTitle('Statistics').setDescription(`Name - \`${core.user.tag}\`
  ID - \`[${core.user.id}]\`
  Latency - \`${interaction.createdTimestamp - reply.createdTimestamp}ms\`
  Api Latency - \`${Math.round(core.ws.ping)}ms\`
  Runtime - \`${formatDuration(core.uptime, { leading: true })}\`
  Memory usage - \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
    2
  )}mb\`
  Active players - \`${core.manager.players.size}\``)
      ]
    });
  }
};

export default Stats;
