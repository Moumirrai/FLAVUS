import { Node } from 'magmastream';
import { iManagerEvent } from 'flavus';

const nodeReconnectEvent: iManagerEvent = {
  name: 'nodeReconnect',
  execute(client, _manager, node: Node) {
    client.logger.info(`Node "${node.options.identifier}" reconnecting`);
  }
};

export default nodeReconnectEvent;
