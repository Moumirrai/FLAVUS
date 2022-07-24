import { iEvent } from 'flavus';

const ReadyEvent: iEvent = {
  name: 'ready',
  async execute(client) {
    client.manager.init(client.user.id);
    client.logger.info(`Logged in as ${client.user.tag}`);
  }
};

export default ReadyEvent;
