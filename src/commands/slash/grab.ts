import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';
import formatDuration from 'format-duration';

const Grab: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('grab')
    .setDescription('Send info about current track to your DMs'),

  requirements: {
    playerRequired: true,
    currentTrackRequired: true
  },

  execute: async ({ interaction, core, player }) => {
    await interaction.user.send({
      embeds: [
        new EmbedBuilder()
          .setThumbnail(
            `https://img.youtube.com/vi/${player.queue.current.identifier}/mqdefault.jpg`
          )
          .setURL(player.queue.current.uri)
          .setColor(core.config.embed.color)
          .setTitle(`${player.queue.current.title}`)
          .addFields(
            {
              name: 'Duration:',
              value: `\`${formatDuration(player.queue.current.duration, {
                leading: true
              })}\``,
              inline: true
            },
            {
              name: 'Current timestamp',
              value: `\`${formatDuration(player.position, {
                leading: true
              })}\` [LINK](${player.queue.current.uri}&t=${String(
                Math.round(player.position / 1000)
              )})`,
              inline: true
            },
            {
              name: 'Author',
              value: `\`${player.queue.current.author}\``,
              inline: true
            }
          )
          .setTimestamp()
          .setFooter({
            text: `Requested in - ${interaction.guild.name}`,
            iconURL: interaction.guild.iconURL()
          })
      ]
    });
    return core.embeds.info(interaction, { title: 'Info sent to your DMs!' });
  }
};

export default Grab;
