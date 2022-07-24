import { Node } from 'erela.js';
import { iManagerEvent } from 'flavus';

const NodeConnectEvent: iManagerEvent = {
  name: 'nodeConnect',
  async execute(client, _manager, node: Node) {
    client.logger.info(`Node "${node.options.identifier}" connected`);
  }
};

export default NodeConnectEvent;
