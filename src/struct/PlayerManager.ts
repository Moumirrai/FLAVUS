import {
  Client,
  Message,
  VoiceBasedChannel
} from 'discord.js';
import { Manager, Player } from 'erela.js';

export async function connect(
  message: Message,
  client: Client,
  manager: Manager,
  vc: VoiceBasedChannel
): Promise<Player> {
  var player: Player = client.manager.players.get(message.guild.id);
  if (player && player.node && !player.node.connected)
    await player.node.connect();
  if (!player) {
    player = await manager.create({
      guild: message.guild.id,
      voiceChannel: vc.id,
      textChannel: message.channel.id,
      selfDeafen: true
    });
    if (player && player.node && !player.node.connected)
      await player.node.connect();
  }
  if (player.state !== 'CONNECTED') {
    player.set('playerauthor', message.author.id);
    player.connect();
    player.stop();
  }
  return player;
}

