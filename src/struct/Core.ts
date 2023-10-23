import { config } from '../config';
import { LavalinkManager } from './Erela/LavalinkManager';
import { Client, GatewayIntentBits, Collection, Partials } from 'discord.js';
import { readdirSync } from 'fs';
import Logger from './Logger';
import { resolve } from 'path';
import { connect, ConnectOptions, set as mongooseSet } from 'mongoose';
import Functions from './Functions';
import * as Embeds from './Embeds';
import PlayerManager from './PlayerManager';
import { APICore } from '../API/client/APICore';//TODO: fix this
import CLI from './CLI';
import { SlashCommand, ContextCommand } from '../types/Command';

export class Core extends Client {
  constructor() {
    super({
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User
      ],
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildVoiceStates,
      ],
      presence: {
        status: 'dnd'
      }
    });

    this.config = config;
    this.manager = new LavalinkManager(this); // Erela.js manager (audio)
  }
  public logger = Logger;

  public commands = new Collection<string, SlashCommand>(); // Commands collection
  public contextMenus = new Collection<string, ContextCommand>(); // Context menus collection

  /**
   * The status of the application.
   * 1 = running, 0 = error.
   * This value is not used anywhere else and its value never changes.
   */
  public status = 1;

  /**
   * Collection of useful functions.
   * TODO: Clean this up
   */
  public functions = Functions;

  /**
   * Embed builders for interactions and messages.
   * TODO: eliminate wildcard import
   */
  public embeds = Embeds;

  /**
   * Missleading name, this is also collection of useful functions related to Player.
   * TODO: Clean this up and rename. Not sure if we even need to store this in the client???
   */

  public PlayerManager = new PlayerManager(this);

  /**
   * Initialize client and start the bot
   */

  public async main(): Promise<void> {
    try {
      this.logger.info('Initializing...');
      this.logger.catchErrors();
      new CLI(this);
      await this.loadEvents();
      await this.loadManagerEvents();
      await this.loadSlashCommands();
      await this.loadContextCommands();
      await this.mongoDB();
      await this.login(this.config.token);
      if (this.config.api) this.apiClient = new APICore(this);
    } catch (error) {
      this.logger.error(error);
      this.destroy();
      process.exit(1);
    }
  }

  /**
   * Connects to MongoDB
   */
  private async mongoDB(): Promise<void> {
    mongooseSet('strictQuery', true);
    connect(this.config.mongodb_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true
    } as ConnectOptions)
      .then(() => {
        return this.logger.info('Connected to MongoDB');
      })
      .catch((err) => {
        return this.logger.error('MongoDB connection error: ' + err);
      });
  }

  /**
   * Loads all commands and aliases from the commands folder
   */

  private async loadSlashCommands(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '../commands/slash')).filter(
      (file) => /\w*.[tj]s/g.test(file)
    );
    for (const file of files) {
      const command = (await import(
        resolve(__dirname, '../commands/slash', file)
      )).default as SlashCommand;
      if (!command?.builder) { 
        return this.logger.error(`Command ${file} is corrupted`)
      }
      if (this.commands.has(command.builder.name)) {
        this.logger.error(
          `Command ${command.builder.name} has a name that already exists!`
        );
      }
      if (command.disabled) return;
      //if (command.permissions) command.builder.setDefaultPermission(false);
      this.commands.set(command.builder.name, command);
    }
    this.logger.info(`${this.commands.size} commands loaded`);
  }

  private async loadContextCommands(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '../commands/context')).filter(
      (file) => /\w*.[tj]s/g.test(file)
    );
    for (const file of files) {
      const command = (await import(
        resolve(__dirname, '../commands/context', file)
      )).default as ContextCommand;
      if (!command || !command.builder) { 
        return this.logger.error(`Context menu ${file} is corrupted`)
      }
      if (this.contextMenus.has(command.builder.name)) {
        this.logger.error(
          `Command ${command.builder.name} has a name that already exists!`
        );
      }
      if (command.disabled) return;
      //if (command.permissions) command.builder.setDefaultPermission(false);
      this.contextMenus.set(command.builder.name, command);
    }
    this.logger.info(`${this.contextMenus.size} commands loaded`);
  }

  /**
   * This function loads and executes all client events from the events folder
   * So all events, like message, ready, etc. will be loaded and executed here
   */

  private async loadEvents(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '../events/client')).filter(
      (file) => /\w*.[tj]s/g.test(file)
    );
    for (const file of files) {
      const event = (await import(resolve(__dirname, '../events/client', file)))
        .default;
      this.on(event.name, (...args) => event.execute(this, ...args));
    }
    this.logger.info(`${files.length} events loaded`);
  }

  /**
   * Same as loadEvents() but for manager (erela) events
   */

  private async loadManagerEvents(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '../events/manager')).filter(
      (file) => /\w*.[tj]s/g.test(file)
    );
    for (const file of files) {
      const event = (
        await import(resolve(__dirname, '../events/manager', file))
      ).default;
      this.manager.on(event.name, (...args) =>
        event.execute(this, this.manager, ...args)
      );
    }
    this.logger.info(`${files.length} manager events loaded`);
  }
}
