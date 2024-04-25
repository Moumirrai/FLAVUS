import { Manager } from 'magmastream';
import type { Core } from '../Core';

export class LavalinkManager extends Manager {
  client: Core;
  constructor(client: Core) {
    super({
      nodes: client.config.erela.nodes,
      shards: client.config.erela.shards,
      clientName: client.config.erela.clientName,
      send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
      autoPlay: false,
      defaultSearchPlatform: 'youtube'
    });
    this.client = client;
  }
}
