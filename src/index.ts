import { Core } from './struct/Core';

const client = new Core();

(async () => {
  await client.main();
})();
