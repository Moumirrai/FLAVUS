import { iManagerEvent } from 'my-module';
import { GuildModel } from '../../models/guildModel';

const playerMoveEvent: iManagerEvent = {
  name: 'playerCreate',
  async execute(client, _manager, player) {
    GuildModel.findOne({ guildID: player.options.guild }, (err, settings) => {
      if (err) return client.logger.error(err);
      if (!settings) return;
      player.setVolume(settings.volume);
    });
  }
};

export default playerMoveEvent;
