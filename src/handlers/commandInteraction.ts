import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits
} from 'discord.js';
import type { Core } from '../struct/Core';
import { Player } from 'magmastream';

export async function handleCommand(
  core: Core,
  interaction: ChatInputCommandInteraction
) {
  const member = interaction.member as GuildMember;
  if (!interaction.inGuild()) return await core.embeds.error(interaction, 'This command can only be used in a server');
  const command = core.commands.get(interaction.commandName);
  if (!command)
    return await core.embeds.error(
      interaction,
      'Command not found'
    );

  const player: Player = core.manager.get(interaction.guildId);
  if (command.requirements?.playerRequired && !player)
    return await core.embeds.error(
      interaction,
      'There is no player'
    );
  const { channel } = member.voice;
  if (command.requirements?.voiceRequired && !channel)
    return await core.embeds.error(
      interaction,
      'You must be in a voice channel to use this command'
    );
  if (
    command.requirements?.sameChannelRequired &&
    player?.voiceChannel !== channel.id
  )
    return await core.embeds.error(
      interaction,
      'You must be in the same voice channel to use this command'
    );
  if (
    command.requirements?.joinPermissionRequired &&
    !channel
      .permissionsFor(interaction.guild.client.user)
      .has(PermissionFlagsBits.Connect)
  )
    return await core.embeds.error(
      interaction,
      'I do not have permission to join your voice channel'
    );
  if (
    command.requirements?.joinPermissionRequired &&
    !channel
      .permissionsFor(interaction.guild.client.user)
      .has(PermissionFlagsBits.Speak)
  )
    return await core.embeds.error(
      interaction,
      'I do not have permission to speak in your voice channel'
    );
  try {
    await command.execute({ interaction, core, player, channel });
  } catch (error) {
    return await core.embeds.error(
      interaction,
      'An error occurred, please try again later.'
    );
  }
}
