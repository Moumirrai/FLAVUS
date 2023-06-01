import { Player } from 'erela.js';
import { iManagerEvent } from 'flavus';

const playerCreateEvent: iManagerEvent = {
  name: 'playerCreate',
  async execute(client, _manager, player: Player) {
    const doc = await client.functions.fetchGuildConfig(player.guild);
    if (!doc) return client.logger.error('Something went wrong! - playerCreateEvent');
    if (doc.volume !== player.volume) player.setVolume(doc.volume);
    player.queue.history = [];
    if (client.config.debugMode)
      client.logger.info('[EVENT] Player created');
  }
};

export default playerCreateEvent;
