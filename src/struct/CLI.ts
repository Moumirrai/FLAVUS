import { Core } from './Core';
import { removeAllCommands, deployAllCommands } from './Deployer';

export default class CLI {
  private core: Core;
  constructor(core: Core) {
    this.core = core;
    this.listen();
  }

  private async listen() {
    process.stdin.on('data', async (data) => {
      const cmd = data.toString().trim().toLowerCase();
      switch (cmd) {
        case 'exit':
          process.exit(0);
          break;
        case 'help':
          this.core.logger.info('Commands: exit, deploy, remove');
          break;
        case 'deploy':
          await deployAllCommands();
          break;
        case 'remove':
          await removeAllCommands();
          break;
      }
    });
  }
}
