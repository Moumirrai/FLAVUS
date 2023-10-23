import { REST, Routes } from 'discord.js';
import { config } from '../config';
import Logger from './Logger';
import { SlashCommand } from '../types/Command';
import { readdirSync } from 'fs';
import { resolve } from 'path';

const rest = new REST().setToken(config.token);

if (process.argv.includes('--deploy')) {
  deployAllCommands();
} else if (process.argv.includes('--remove')) {
  removeAllCommands();
}

export async function removeAllCommands() {
  try {
    Logger.info('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(config.clientId), { body: [] });
    Logger.info('Successfully removed all application (/) commands.');
  } catch (error) {
    Logger.error(error);
  }
}

export async function deployAllCommands() {
  Logger.info('Started refreshing application (/) commands.');

  let commands = [];
  let contextCommands = [];

  const cmdfiles = readdirSync(resolve(__dirname, '../commands/slash')).filter((file) =>
    /\w*.[tj]s/g.test(file)
  );
  for (const file of cmdfiles) {
    const command = (await import(resolve(__dirname, '../commands/slash', file))).default as SlashCommand;
    if (command.disabled) return;
    commands.push(command.builder.toJSON());
  }
  Logger.info(`${commands.length} commands loaded`);

  const ctxfiles = readdirSync(resolve(__dirname, '../commands/context')).filter((file) =>
    /\w*.[tj]s/g.test(file)
  );
  for (const file of ctxfiles) {
    const command = (await import(resolve(__dirname, '../commands/context', file))).default as SlashCommand;
    if (command.disabled) return;
    contextCommands.push(command.builder.toJSON());
  }
  Logger.info(`${contextCommands.length} context menus loaded`);

  commands = [...commands, ...contextCommands];

  try {
    await rest.put(Routes.applicationCommands(config.clientId), {
      body: commands
    });
    Logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    Logger.error(error);
  }
  commands = [];
}
