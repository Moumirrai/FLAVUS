import { Node } from 'erela.js';
import { iManagerEvent } from 'my-module';

const nodeDisconnectEvent: iManagerEvent = {
  name: 'nodeDisconnect',
  async execute(client, _manager, node: Node) {
    client.logger.info(`Node "${node.options.identifier}" disconnected`);
  }
};

export default nodeDisconnectEvent;
