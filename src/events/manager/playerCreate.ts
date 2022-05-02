import { iManagerEvent } from 'my-module';
import { GuildModel } from '../../models/guildModel';

const playerMoveEvent: iManagerEvent = {
  name: 'playerCreate',
  async execute(client, _manager, player) {
    GuildModel.findOne({ guildID: player.options.guild }, (err, settings) => {
      if (err) return client.logger.error(err);
      if (!settings) return;
      if (player.volume !== settings.volume) player.setVolume(settings.volume);
    });
    client.logger.info(`[EVENT] Player created: ${player.options.guild}`);
  }
};

export default playerMoveEvent;
