import { EmbedData, SlashCommandBuilder, User } from 'discord.js';
import { SlashCommand } from '../../types/Command';
import http from 'http';

const Play: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('play')
    .setDescription(
      'Searches for a song or playlist and plays it in your channel'
    )
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The song or playlist you want to play')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  requirements: {
    voiceRequired: true,
    joinPermissionRequired: true
  },

  autocomplete: async ({ core, interaction }) => {
    const query = interaction.options.getString('query');
    if (!query) {
      return interaction.respond([]);
    }
    const res = await getAutocompleteQueries(query);
    const tracks = res[1];

    await interaction.respond(
      tracks.map((track) => ({
        name: core.functions.escapeRegex(track),
        value: track
      }))
    );
  },

  execute: async ({ interaction, core, channel }) => {
    const query = interaction.options.getString('query');
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
      //return message.channel.send(res);
    } catch (err) {
      return core.embeds.error(interaction, {
        title: 'Error while searching',
        description: err.message.toString()
      });
    }
  }
};

/*
export default new FlavusCommand({
  builder: new SlashCommandBuilder()
    .setName('play')
    .setDescription(
      'Searches for a song or playlist and plays it in your channel'
    )
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('The song or playlist you want to play')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  requirements: {
    voiceRequired: true,
    joinPermissionRequired: true
  },

  autocomplete: async ({ core, interaction }) => {
    const query = interaction.options.getString('query');
    if (!query) {
      return interaction.respond([]);
    }
    const res = await getAutocompleteQueries(query);
    const tracks = res[1];

    await interaction.respond(
      tracks.map((track) => ({
        name: core.functions.escapeRegex(track),
        value: track
      }))
    );
  },

  execute: async ({ interaction, core, channel }) => {
    const query = interaction.options.getString('query');
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
      //return message.channel.send(res);
    } catch (err) {
      return core.embeds.error(interaction, {
        title: 'Error while searching',
        description: err.message.toString()
      });
    }
  }
});
*/

const AutocompleteURL =
  'http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=';

async function getAutocompleteQueries(query) {
  return new Promise((resolve, reject) => {
    http
      .get(AutocompleteURL + query, function (res) {
        let rawData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        });
      })
      .on('error', function (e) {
        reject(e.message);
      });
  });
}

export default Play;
