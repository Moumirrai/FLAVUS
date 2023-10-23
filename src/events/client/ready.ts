import { iEvent } from 'flavus';
import { Events } from 'discord.js'

const ReadyEvent: iEvent = {
  name: Events.ClientReady,
  execute(client) {
    client.manager.init(client.user.id);
    client.logger.info(`Logged in as ${client.user.tag}`);
  }
};

export default ReadyEvent;
