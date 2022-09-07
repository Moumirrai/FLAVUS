import { MessageEmbed } from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';

const SkipCommand: iCommand = {
  name: 'skip',
  aliases: ['s'],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: true,
  description: 'Skips to next or specific track',
  usage: `\`<prefix>skip\` or \`<prefix>s <position in queue>\``,
  async execute({ client, message, args, player }: CommandArgs): Promise<any> {
    if (player.queue.size == 0 && !player.queue.current) {
      await message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle('No more tracks in queue!')
            .setColor(client.config.embed.color)
        ]
      });
      if (!message.guild.me.voice.channel) {
        try {
          player.destroy();
        } catch {}
      }
    }
    if (args[0] && !isNaN(Number(args[0]))) {
      if (Number(args[0]) > player.queue.size || Number(args[0]) < 1) {
        //if the user wants to skip more tracks than are in the queue
        await message.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("Can't skip there!")
              .setColor(client.config.embed.color)
          ]
        });
        return;
      } else {
        if (Number(args[0]) != 1) player.queue.remove(0, Number(args[0]) - 1); //remove tracks from queue
      }
    }
    player.stop(); // skip the track
    return message.react('⏭').catch((e) => {client.logger.error(e)});
  }
};

export default SkipCommand;
