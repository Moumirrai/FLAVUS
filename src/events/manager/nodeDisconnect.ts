import { Node } from 'magmastream';
import { iManagerEvent } from 'flavus';

const nodeDisconnectEvent: iManagerEvent = {
  name: 'nodeDisconnect',
  execute(client, _manager, node: Node) {
    client.logger.info(`Node "${node.options.identifier}" disconnected`);
  }
};

export default nodeDisconnectEvent;
