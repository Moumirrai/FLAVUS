import { iEvent } from 'my-module';

const readyEvent: iEvent = {
  name: 'ready',
  async execute(client) {
    client.manager.init(client.user.id);
    client.logger.info(`Logged in as ${client.user.tag}`);
  }
};

export default readyEvent;
