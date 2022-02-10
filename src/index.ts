import { BotClient } from './struct/Client';

const client = new BotClient();

(async () => {
  await client.main();
})();
