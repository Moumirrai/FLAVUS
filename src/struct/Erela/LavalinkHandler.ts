import { Manager } from 'erela.js';
import type { Core } from '../Core';
import Spotify from 'better-erela.js-spotify';

export class LavalinkHandler extends Manager {
  client: Core;
  constructor(client: Core) {
    super({
      nodes: client.config.erela.nodes,
      plugins: [
        new Spotify({
          clientId: process.env.SPOTIFY_ID!,
          clientSecret: process.env.SPOTIFY_SECRET!,
          convertUnresolved: false,
          strategy: process.env.SPOTIFY_SECRET ? 'API' : 'SCRAPE'
        })
      ],
      shards: client.config.erela.shards,
      clientName: client.config.erela.clientName,
      send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
      autoPlay: false
    });
    this.client = client;
  }
}
