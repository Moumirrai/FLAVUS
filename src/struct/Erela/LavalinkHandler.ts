import { MessageEmbed } from 'discord.js';
import { Manager } from 'erela.js';
import type { BotClient } from '../Client';
const ErelaSpotify = require('erela.js-spotify');

export class LavalinkHandler extends Manager {
  embedReply: MessageEmbed;
  client: BotClient;
  constructor(client: BotClient) {
    super({
      nodes: client.config.erela.nodes,
      plugins: [
        new ErelaSpotify({
          clientID: process.env.SPOTIFY_ID!,
          clientSecret: process.env.SPOTIFY_SECRET!,
          convertUnresolved: false
        })
      ],
      shards: client.config.erela.shards,
      clientName: client.config.erela.clientName,
      send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      }
    });

    this.embedReply = new MessageEmbed();
    this.client = client;
  }
}
