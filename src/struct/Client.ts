import { config } from '../config/config';
import { DiscordTogether } from 'discord-together';
import { LavalinkHandler } from './Erela/LavalinkHandler';
import Genius from 'genius-lyrics';
import { Client, Intents, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import Logger from './Logger';
import { resolve } from 'path';
import type { iCommand } from 'my-module';
import { connect, ConnectOptions } from 'mongoose';
import * as Functions from './Functions';

export class BotClient extends Client {
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
    this.manager = new LavalinkHandler(this);
    this.DiscordTogether = new DiscordTogether(this);
    if (process.env.GENIUS) {
      this.lyrics = new Genius.Client(process.env.GENIUS);
    } else {
      this.lyrics = new Genius.Client();
    }
  }
  public logger = Logger;
  public aliases = new Collection<string, iCommand>();
  public commands = new Collection<string, iCommand>();
  public guildDb = new Collection<string, any>();

  public functions = Functions;
  public async main() {
    try {
      this.logger.info('Initializing...');
      await this.loadEvents();
      await this.loadManagerEvents();
      await this.loadCommands();
      await this.mongoDB();
      await this.login(this.config.token);
    } catch (error) {
      this.logger.error(error);
      this.destroy();
      process.exit(1);
    }
  }

  public sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  private async mongoDB(): Promise<void> {
    connect(this.config.mongodb_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false
    } as ConnectOptions)
      .then(() => {
        this.logger.info('Connected to MongoDB');
      })
      .catch((err) => {
        this.logger.error('MongoDB connection error: ' + err);
      });
  }

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
