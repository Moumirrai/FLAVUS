import { Node } from 'erela.js';
import { iManagerEvent } from 'flavus';

const nodeDisconnectEvent: iManagerEvent = {
  name: 'nodeDisconnect',
  async execute(client, _manager, node: Node) {
    client.logger.info(`Node "${node.options.identifier}" disconnected`);
  }
};

export default nodeDisconnectEvent;
