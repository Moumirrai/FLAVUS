import { Player } from 'magmastream';
import { iManagerEvent } from 'flavus';

const playerCreateEvent: iManagerEvent = {
  name: 'playerCreate',
  async execute(client, _manager, player: Player) {
    //TODO: Delete this
    //const doc = await client.functions.fetchGuildConfig(player.guild);
    //if (!doc) return client.logger.error('Something went wrong! - playerCreateEvent');
    //if (doc.volume !== player.volume) player.setVolume(doc.volume); //FAULTY LINE, TODO: resolve thos
    player.queue.history = [];
    if (client.config.debugMode)
      client.logger.info('[EVENT] Player created');
    return;
  }
};

export default playerCreateEvent;
