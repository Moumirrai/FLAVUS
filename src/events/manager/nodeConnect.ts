import { Node } from 'magmastream';
import { iManagerEvent } from 'flavus';

const NodeConnectEvent: iManagerEvent = {
  name: 'nodeConnect',
  execute(client, _manager, node: Node) {
    client.logger.info(`Node "${node.options.identifier}" connected`);
  }
};

export default NodeConnectEvent;
