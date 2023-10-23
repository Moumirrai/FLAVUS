import { Client, GatewayIntentBits, Events, Partials } from 'discord.js';
import { Manager } from 'erela.js';
import { config, BotConfig } from '../../src/config/config';
import { LavalinkManager } from '../../src/struct/Erela/LavalinkManager';
import { Core } from '../../src/struct/Core';

interface MyClient extends Core {
  config: BotConfig;
  manager: LavalinkManager;
}

class MyClient extends Client {
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
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
      ],
      presence: {
        status: 'dnd'
      }
    });

    this.config = config;
    this.manager = new LavalinkManager(this);
    this.listen();
  }
  public async loginTest(): Promise<string> {
    return await this.login(this.config.token);
  }
  public async listen() {
    this.on(Events.ClientReady, () => {
      console.log('ready');
	  this.manager.init(this.user!.id);
    });
    this.manager.on('nodeConnect', (node) => {
      console.log('node connected');
    });

    //log every event on manager

    this.manager.on('nodeError', (node, error) => {
      console.log(
        `Node "${node.options.identifier}" encountered an error: ${error.message}.`
      );
    });
  }
  public destroy(): void {
    super.destroy();
  }
}

export default MyClient;
