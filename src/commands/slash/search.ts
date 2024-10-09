import { EmbedData, SlashCommandBuilder, User } from 'discord.js';
import { SlashCommand } from '../../types/Command';

const Search: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('search')
    .setDescription(
      'Searches for a song or playlist and plays it in your channel'
    )
    .addStringOption((option) =>
      option
        .setName('search')
        .setDescription('What do you want to search for')
        .setRequired(true)
        .setAutocomplete(true)
    ) as SlashCommandBuilder,

  requirements: {
    voiceRequired: true,
    joinPermissionRequired: true
  },

  autocomplete: async ({ core, interaction }) => {
    const query = interaction.options.getString('search');
    if (!query) {
      return interaction.respond([]);
    }
    const res = await core.manager.search(query, interaction.user);
    if (!res || !res.tracks) return;
    const tracks = res.tracks;
    await interaction.respond(
      tracks.map((track) => ({
        //name: core.functions.escapeRegex(`${track.title} - ${track.author}`),
        name: core.functions.escapeRegex(
          `${
            track.title.length > 50
              ? `${track.title.slice(0, 50)}...`
              : track.title
          }` +
            ` - ${
              track.author.length > 50
                ? `${track.author.slice(0, 40)}...`
                : track.author
            }`
        ),
        value: track.uri
      }))
    );
  },

  execute: async ({ interaction, core, channel }) => {
    const query = interaction.options.getString('search');
    if (!query) return core.embeds.error(interaction, 'No query provided!');

    const player = await core.PlayerManager.connect(
      interaction.channel,
      core.manager,
      channel
    );
    if (!player) {
      return core.embeds.error(interaction, 'Player failed to connect!');
    }
    try {
      const res = (await core.PlayerManager.search(query, player, {
        author: interaction.member.user as User,
        handleResult: true
      })) as EmbedData;
      if (!res) {
        throw new Error('No results were found!');
      }
      return core.embeds.info(interaction, res, false);
    } catch (err) {
      return core.embeds.error(interaction, {
        title: 'Error while searching',
        description: err.message.toString()
      });
    }
  }
};

export default Search;
