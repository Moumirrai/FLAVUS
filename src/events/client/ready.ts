import { iEvent } from 'flavus';

const ReadyEvent: iEvent = {
  name: 'ready',
  execute(client) {
    client.manager.init(client.user.id);
    client.logger.info(`Logged in as ${client.user.tag}`);
  }
};

export default ReadyEvent;
