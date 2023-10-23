import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const DefaultChannel: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('defaultchannel')
    .setDescription(
      'Sets channel as default channel for notifications from autoplay'
    )
    .addBooleanOption((option) =>
      option
        .setName('clear')
        .setDescription('Reverts to default value')
        .setRequired(false)
    ),

  execute: async ({ interaction, core, player }) => {
    const clear = interaction.options.getBoolean('clear');
    const doc = await core.functions.fetchGuildConfig(interaction.guild.id);
    if (!doc)
      return core.embeds.error(interaction, { title: 'Something went wrong!' });
    if (!doc.autoplay) {
      doc.autoplay = {
        active: true,
        mode: 'yt'
      };
    }
    if (clear) {
      doc.statusChannel = undefined;
      await doc.save();
      return core.embeds.info(
        interaction,
        {
          title: 'Notification channel cleared',
          description: 'Notifications will be sent to your voice channel.',
          url: 'https://flavus.xyz'
        },
        false
      );
    } else {
      doc.statusChannel = {
        name: interaction.channel.name,
        id: interaction.channel.id
      };
      await doc.save();
      return core.embeds.info(
        interaction,
        {
          title: `Notification channel set to \`#${interaction.channel.name}\``,
          description:
            'This channel will be used when the player is initialized from the web interface.',
          url: 'https://flavus.xyz'
        },
        false
      );
    }
  }
};

export default DefaultChannel;
