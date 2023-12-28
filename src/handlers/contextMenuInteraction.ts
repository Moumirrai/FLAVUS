import {
  ContextMenuCommandInteraction,
  GuildMember,
  PermissionFlagsBits
} from 'discord.js';
import { Player } from 'magmastream';
import type { Core } from '../struct/Core';
export async function handleContextMenu(
  core: Core,
  interaction: ContextMenuCommandInteraction
) {
  const member = interaction.member as GuildMember;
  if (!interaction.inGuild())
    return await core.embeds.error(
      interaction,
      'This command can only be used in a server'
    );
  const command = core.contextMenus.get(interaction.commandName);
  if (!command?.context) return console.log('Command not found');
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
    await command.context({ core, interaction, player, channel });
  } catch (error) {
    return console.log(error);
  }
}
