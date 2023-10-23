import { iEvent } from 'flavus';
import {
  BaseInteraction,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  ContextMenuCommandInteraction
} from 'discord.js';
import { handleCommand } from '../../handlers/commandInteraction';
import { handleAutocomplete } from '../../handlers/autocompleteInteraction';
import { handleContextMenu } from '../../handlers/contextMenuInteraction';
import { Events } from 'discord.js'

const InteractionEvent: iEvent = {
  name: Events.InteractionCreate,
  execute(core, interaction: BaseInteraction) {
    if (interaction.isChatInputCommand())
      handleCommand(core, interaction as ChatInputCommandInteraction);
    else if (interaction.isAutocomplete()) {
      handleAutocomplete(core, interaction as AutocompleteInteraction);
    } else if (interaction.isContextMenuCommand()) {
      handleContextMenu(core, interaction as ContextMenuCommandInteraction);
    }
  }
};

export default InteractionEvent;
