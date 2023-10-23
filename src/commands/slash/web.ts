import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle
} from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Web: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('web')
    .setDescription('Flavus Web App'),

  execute: async ({ interaction, core, player }) => {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setURL('https://flavus.xyz')
        .setLabel('Flavus - Web App')
        .setStyle(ButtonStyle.Link)
    );

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Flavus - Web App')
          .setDescription(
            'Click the button below to open the Flavus web app in your browser!'
          )
          .setImage(
            'https://cdn.discordapp.com/attachments/776802172020981794/1120082141657698366/WEB_s.png'
          )
          .setColor(core.config.embed.color)
      ],
      components: [row]
    });
  }
};

export default Web;
