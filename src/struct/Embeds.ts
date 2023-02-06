import {
  MessageEmbed,
  TextBasedChannel,
  ColorResolvable,
  Message,
  MessageOptions,
  MessageEmbedOptions
} from 'discord.js';
import { config } from '../config/config';

export const error = embedFactory(config.embed.errorcolor, 'Error');
export const info = embedFactory(config.embed.color, 'Info');

function embedFactory(color: ColorResolvable, defaultTitle: string) {
  return async (
    channel: TextBasedChannel,
    data?: MessageEmbedOptions | string
  ): Promise<Message> => {
    try {
      if (typeof data === 'string') {
        return channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(color)
              .setTitle(defaultTitle)
              .setDescription(data)
          ]
        });
      } else {
        return channel.send({
          embeds: [
            new MessageEmbed({ ...data })
              .setColor(color)
              .setTitle(data.title || defaultTitle)
          ]
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
}

export const build = (
  data: MessageEmbedOptions,
  error?: boolean
): MessageOptions => {
  const embed = new MessageEmbed({
    ...data
  }).setColor(error ? config.embed.errorcolor : config.embed.color);
  return { embeds: [embed] };
};
