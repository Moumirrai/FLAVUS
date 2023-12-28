import {
  PermissionResolvable,
  ChatInputCommandInteraction,
  VoiceBasedChannel,
  AutocompleteInteraction,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction
} from 'discord.js';

import { SlashCommandBuilder } from '@discordjs/builders';

import { Core } from '../struct/Core';

import { Player } from 'magmastream';

type CommandBuilder = Omit<
  SlashCommandBuilder,
  'addSubcommand' | 'addSubcommandGroup'
>;

/** Arguments for command */
export type BaseArgs<T> = {
  interaction: T;
  core: Core;
  player?: Player;
  channel?: VoiceBasedChannel;
};

export type CommandArgs = BaseArgs<ChatInputCommandInteraction>;

export type ContextArgs = BaseArgs<ContextMenuCommandInteraction>;

export type AutocompleteArgs = {
  interaction: AutocompleteInteraction;
  core: Core;
};

export interface CommandRequirements {
  voiceRequired?: boolean;
  playerRequired?: boolean;
  currentTrackRequired?: boolean;
  sameChannelRequired?: boolean;
  joinPermissionRequired?: boolean;
  devOnly?: boolean;
}

interface BaseCommandI<T extends CommandBuilder | ContextMenuCommandBuilder> {
  builder: T;
  disabled?: boolean;
  permissions?: PermissionResolvable[];
  onlyDev?: boolean;
  requirements?: CommandRequirements;
}

export interface SlashCommand extends BaseCommandI<CommandBuilder> {
  execute(args: CommandArgs): any;
  autocomplete?(args: AutocompleteArgs): any;
}

export interface ContextCommand
  extends BaseCommandI<ContextMenuCommandBuilder> {
  context(args: ContextArgs): any;
}
