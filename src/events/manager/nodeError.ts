import { Node } from 'magmastream';
import { iManagerEvent } from 'flavus';

const nodeErrorEvent: iManagerEvent = {
  name: 'nodeError',
  execute(client, _manager, node: Node, error) {
    client.logger.error(`Node "${node.options.identifier}" errored - ${error}`);
  }
};

export default nodeErrorEvent;
