import { Node } from 'erela.js';
import { iManagerEvent } from 'my-module';

const nodeErrorEvent: iManagerEvent = {
  name: 'nodeError',
  async execute(client, _manager, node: Node, error) {
    client.logger.error(`Node "${node.options.identifier}" errored`);
  }
};

export default nodeErrorEvent;
