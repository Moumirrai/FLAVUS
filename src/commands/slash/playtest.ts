import {
  EmbedData,
  Guild,
  GuildMember,
  SlashCommandBuilder,
  User
} from 'discord.js';
import { SlashCommand } from '../../types/Command';
import http from 'http';

const Play: SlashCommand = {
  builder: new SlashCommandBuilder()
    .setName('playtest')
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

  execute: async ({ interaction, core, channel }) => {
    if (!interaction.replied || interaction.deferred) {
      await interaction.deferReply({
        ephemeral: false
      });
    }

    //if interaction.member is not type GuildMember, then return

    const query = interaction.options.getString('query');

    if (!channel.id) {
      return await interaction.editReply({
        content: 'You must be in a voice channel to use this command.'
      });
    }

    const botCurrentVoiceChannelId =
      interaction.guild?.members.me?.voice.channelId;

    if (
      botCurrentVoiceChannelId &&
      channel.id &&
      channel.id !== botCurrentVoiceChannelId
    ) {
      return await interaction.editReply({
        content: `You must be connnected to the same voice channel as me to use this command. <#${botCurrentVoiceChannelId}>`
      });
    }

    const player = core.manager.create({
      guild: interaction.guildId,
      textChannel: interaction.channelId,
      voiceChannel: channel.id,
      selfDeafen: true,
      volume: 100
    });

    if (player.state !== 'CONNECTED') player.connect();

    const result = await player.search(query, interaction.user);

    switch (result.loadType) {
      case 'empty':
        if (!player.queue.current) player.destroy();

        return await interaction.editReply({
          content: `Load failed when searching for \`${query}\``
        });

      case 'error':
        if (!player.queue.current) player.destroy();

        return await interaction.editReply({
          content: `No matches when searching for \`${query}\``
        });

      case 'track':
        player.queue.add(result.tracks[0]);

        if (!player.playing && !player.paused && !player.queue.length) {
          await player.play();
        }

        return await interaction.editReply({
          content: `Added [${result.tracks[0].title}](${result.tracks[0].uri}) to the queue.`
        });

      case 'playlist':
        if (!result.playlist?.tracks) return;

        player.queue.add(result.playlist.tracks);

        if (
          !player.playing &&
          !player.paused &&
          player.queue.size === result.playlist.tracks.length
        ) {
          await player.play();
        }

        return await interaction.editReply({
          content: `Added [${result.playlist.name}](${query}) playlist to the queue.`
        });

      case 'search':
        player.queue.add(result.tracks[0]);
        if (!player.playing && !player.paused && !player.queue.length) {
          await player.play();
        }

        return await interaction.editReply({
          content: `Added [${result.tracks[0].title}](${result.tracks[0].uri}) to the queue.`
        });
    }
  }
};

export default Play;
