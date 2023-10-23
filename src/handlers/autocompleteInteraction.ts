import { AutocompleteInteraction, GuildMember } from 'discord.js';
import type { Core } from '../struct/Core';
export async function handleAutocomplete(
  core: Core,
  interaction: AutocompleteInteraction
) {
  const member = interaction.member as GuildMember;
  if (!interaction.inGuild())
    return await core.embeds.error(
      interaction,
      'This command can only be used in a server'
    );
  const command = core.commands.get(interaction.commandName);
  if (!command?.autocomplete) return console.log('Command not found');
  const { channel } = member.voice;
  if (command.requirements?.voiceRequired && !channel)
    return interaction.respond([]);

  try {
    await command.autocomplete({ core, interaction });
  } catch (error) {
    return console.log(error);
  }
}
