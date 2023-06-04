import { MessageEmbed } from 'discord.js';
import { CommandArgs, Command } from 'flavus';
import { Track } from 'erela.js';

const DebugCommand: Command = {
  name: 'debug',
  visible: false,
  description: 'debug',
  requirements: {
    voiceRequired: true,
    playerRequired: true,
    sameChannelRequired: true
  },
  async execute({ client, message, player }: CommandArgs) {
    const smQueue = player.get('similarQueue') as Track[];
    if (!smQueue || smQueue.length === 0) {
      await message.author.send('Autoplay temp queue is empty');
    } else {
      let trackString = '';
      //for each track in the queue, add its index number and the track's name to the string at new line
      smQueue.forEach((track, index) => {
        trackString += `\`#${index}\` - ${track.title}`;
        trackString += '\n';
      });
      return message.author.send({
        embeds: [
          new MessageEmbed()
            .setColor(client.config.embed.color)
            .setTitle('Autoplay temp queue')
            .setDescription(trackString)
        ]
      });
    }
  }
};

export default DebugCommand;
