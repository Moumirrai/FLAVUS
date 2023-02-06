import { Player } from 'erela.js';
import { iManagerEvent } from 'flavus';
import { GuildModel } from '../../models/guildModel';

const playerCreateEvent: iManagerEvent = {
  name: 'playerCreate',
  async execute(client, _manager, player: Player) {
    GuildModel.findOne({ guildID: player.options.guild }, (err, settings) => {
      if (err) return client.logger.error(err);
      if (!settings) return;
      if (player.volume !== settings.volume) player.setVolume(settings.volume);
    });
    player.queue.history = [];
    if (client.config.debugMode)
      client.logger.info('[EVENT] Player created');
  }
};

export default playerCreateEvent;
