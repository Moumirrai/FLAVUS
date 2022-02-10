import { Node } from 'erela.js';
import { iManagerEvent } from 'my-module';

const nodeReconnectEvent: iManagerEvent = {
  name: 'nodeReconnect',
  async execute(client, _manager, node: Node) {
    client.logger.info(`Node "${node.options.identifier}" reconnecting`);
  }
};

export default nodeReconnectEvent;
