import { iEvent } from 'flavus';
import { EmbedBuilder, Events, Message } from 'discord.js';

//TODO: DELETE THIS FILE

const handleMessageCreateEvent: iEvent = {
  name: Events.MessageCreate,
  async execute(client, message: Message) {
    if (!message.content || !message.guild || message.author.bot) return;
    if (!message.content.startsWith(client.config.prefix)) return;
    return message.reply({
      embeds: [
        new EmbedBuilder({
          title:
            'Message based commands have been replaced with slash commands!',
          description: 'Try using `/play` for example.'
        }).setColor('Red')
      ]
    });
  }
};

export default handleMessageCreateEvent;
