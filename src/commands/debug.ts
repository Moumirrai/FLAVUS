import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  User
} from 'discord.js';
import { CommandArgs, iCommand } from 'flavus';
import formatDuration = require('format-duration');
import { Player, Track, SearchResult } from 'erela.js';

//define typo for player.queue.current.requester as User


const DebugCommand: iCommand = {
  name: 'debug',
  aliases: [],
  voiceRequired: true,
  joinPermissionRequired: false,
  playerRequired: true,
  sameChannelRequired: true,
  visible: false,
  description: 'debug',
  usage: '<prefix>debug',
  async execute({ client, message, player }: CommandArgs): Promise<void | Message> {
    const smQueue = player.get(`similarQueue`)  as Track[]
    if (!smQueue || smQueue.length === 0) {
      message.author.send(`Autoplay temp queue is empty`)
    } else {
      let trackString = ''
      //for each track in the queue, add its index number and the track's name to the string at new line
      smQueue.forEach((track, index) => {
        trackString += `\`#${index}\` - ${track.title}`
        trackString += '\n'
      })
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
