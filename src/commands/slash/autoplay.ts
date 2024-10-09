import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

enum Options {
  Spotify = 'spotify',
  YouTube = 'yt'
}

const AutoplayCommand: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('Toggles or changes autoplay config')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('What mode to use')
        .setRequired(false)
        .addChoices(
          { name: 'Spotify', value: Options.Spotify },
          { name: 'YouTube', value: Options.YouTube }
        )
    ) as SlashCommandBuilder,

  execute: async ({ interaction, core, player }) => {
    const mode = interaction.options.getString('mode') as Options;
    const doc = await core.functions.fetchGuildConfig(interaction.guild.id);
    if (!doc)
      return core.embeds.error(interaction, { title: 'Something went wrong!' });
    if (!doc.autoplay) {
      doc.autoplay = {
        active: true,
        mode: 'yt'
      };
    }
    if (mode) {
      doc.autoplay.mode = mode;
    } else {
      doc.autoplay.active = !doc.autoplay.active;
    }
    await doc.save();
    return core.embeds.info(interaction, {
      title: 'Autoplay',
      description: `Autoplay is ${mode ? '' : 'now'} ${
        doc.autoplay.active ? 'enabled' : 'disabled'
      }\n${
        mode
          ? `Mode is now set to ${
              doc.autoplay.mode === 'yt' ? 'YouTube' : 'Spotify'
            }`
          : `Mode ${doc.autoplay.mode === 'yt' ? 'YouTube' : 'Spotify'}`
      }`
    });
  }
};

export default AutoplayCommand;
/*
export default new SlashCommand({
  builder: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('Toggles or changes autoplay config')
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('What mode to use')
        .setRequired(false)
        .addChoices(
          { name: 'Spotify', value: Options.Spotify },
          { name: 'YouTube', value: Options.YouTube }
        )
    ),

  execute: async ({ interaction, core, player }) => {
    const mode = interaction.options.getString('mode') as Options;
    const doc = await core.functions.fetchGuildConfig(interaction.guild.id);
    if (!doc)
      return core.embeds.error(interaction, { title: 'Something went wrong!' });
    if (!doc.autoplay) {
      doc.autoplay = {
        active: true,
        mode: 'yt'
      };
    }
    if (mode) {
      doc.autoplay.mode = mode;
    } else {
      doc.autoplay.active = !doc.autoplay.active;
    }
    await doc.save();
    return core.embeds.info(interaction, {
      title: 'Autoplay',
      description: `Autoplay is ${mode ? '' : 'now'} ${
        doc.autoplay.active ? 'enabled' : 'disabled'
      }\n${
        mode
          ? `Mode is now set to ${
              doc.autoplay.mode === 'yt' ? 'YouTube' : 'Spotify'
            }`
          : `Mode ${doc.autoplay.mode === 'yt' ? 'YouTube' : 'Spotify'}`
      }`
    });
    //
  }
});
*/
