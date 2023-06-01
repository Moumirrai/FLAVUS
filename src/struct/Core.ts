import { config } from '../config/config';
import { LavalinkManager } from './Erela/LavalinkManager';
import { Client, Intents, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import Logger from './Logger';
import { resolve } from 'path';
import type { iCommand } from 'flavus';
import { connect, ConnectOptions } from 'mongoose';
import Functions from './Functions';
import * as Embeds from './Embeds';
import PlayerManager from './PlayerManager';
import { APICore } from '../API/client/APICore';

export class Core extends Client {
  constructor() {
    super({
      partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER', 'USER'],
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
      ],
      presence: {
        status: 'dnd'
      }
    });

    this.config = config;
    this.manager = new LavalinkManager(this);
  }
  public logger = Logger;

  public aliases = new Collection<string, iCommand>();
  public commands = new Collection<string, iCommand>();

  public status = 1;
  public functions = Functions;
  public embeds = Embeds;
  public PlayerManager = PlayerManager;
  public async main(): Promise<void> {
    try {
      this.logger.info('Initializing...');
      this.logger.catchErrors();
      await this.loadEvents();
      await this.loadManagerEvents();
      await this.loadCommands();
      await this.mongoDB();
      await this.login(this.config.token);
      if (this.config.api) this.apiClient = new APICore(this);
    } catch (error) {
      this.logger.error(error);
      this.destroy();
      process.exit(1);
    }
  }

  private async mongoDB(): Promise<void> {
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

  private async loadCommands(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'commands'));
    for (const file of files) {
      const command = (await import(resolve(__dirname, '..', 'commands', file)))
        .default;
      this.commands.set(command.name, command);
      if (command.aliases.length > 0) {
        command.aliases.forEach((alias) => {
          this.aliases.set(alias, command);
        });
      }
    }
    this.logger.info(`${this.commands.size} commands loaded!`);
  }

  /**
   * This function loads and executes all client events from the events folder
   * So all events, like message, ready, etc. will be loaded and executed here
   */

  private async loadEvents(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'events', 'client'));
    for (const file of files) {
      const event = (
        await import(resolve(__dirname, '..', 'events', 'client', file))
      ).default;
      this.on(event.name, (...args) => event.execute(this, ...args));
    }
    this.logger.info(`${files.length} events loaded!`);
  }

  /**
   * Same as loadEvents() but for manager (erela) events
   */

  private async loadManagerEvents(): Promise<void> {
    const files = readdirSync(resolve(__dirname, '..', 'events', 'manager'));
    for (const file of files) {
      const event = (
        await import(resolve(__dirname, '..', 'events', 'manager', file))
      ).default;
      this.manager.on(event.name, (...args) =>
        event.execute(this, this.manager, ...args)
      );
    }
    this.logger.info(`${files.length} manager events loaded!`);
  }
}

export { Logger };
