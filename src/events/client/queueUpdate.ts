import { iEvent } from 'flavus';
import { Player } from 'erela.js';
import hash from 'hash-sum';

const handleDisconnectVoiceEvent: iEvent = {
  name: 'queueUpdate',
  async execute(client, player?: Player) {
    if (player.hash && player.hash === hash(player.queue)) return;
    player.hash = await hash(player.queue);
    client.logger.info('new hash: ' + player.hash);
    await client.apiClient.playerPing.queueData(player.guild);
  }
};

export default handleDisconnectVoiceEvent;
