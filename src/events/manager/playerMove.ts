import { iManagerEvent } from 'my-module';
import { VoiceBasedChannel } from 'discord.js';

const playerMoveEvent: iManagerEvent = {
  name: 'playerMove',
  async execute(
    client,
    _manager,
    player,
    oldChannel: VoiceBasedChannel,
    newChannel: VoiceBasedChannel
  ) {
    if (!newChannel) {
      await player.destroy();
    } else if (oldChannel == newChannel) {
      return;
    } else {
      player.setVoiceChannel(newChannel);
      if (player.paused) return;
      setTimeout(() => {
        player.pause(true);
        setTimeout(() => player.pause(false), client.ws.ping * 2);
      }, client.ws.ping * 2);
    }
  }
};

export default playerMoveEvent;
