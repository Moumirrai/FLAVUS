import {
  MessageEmbed,
  TextBasedChannel,
  ColorResolvable,
  Message,
  MessageOptions,
  MessageEmbedOptions
} from 'discord.js';
import { config } from '../config/config';
import Logger, { LogLevels } from './Logger';

export const build = (
  data: MessageEmbedOptions,
  error?: boolean
): MessageOptions => {
  const embed = new MessageEmbed({
    ...data
  }).setColor(error ? config.embed.errorcolor : config.embed.color);
  return { embeds: [embed] };
};

class Embed {
  private readonly color: ColorResolvable;
  private readonly defaultTitle: string;
  private readonly log?: LogLevels;
  constructor(color: ColorResolvable, title: string, log?: LogLevels) {
    this.log = log;
    this.color = color;
    this.defaultTitle = title;
  }
  public create = (
    channel: TextBasedChannel,
    data?: MessageEmbedOptions | string
  ): Promise<Message> => {
    try {
      if (typeof data === 'string') {
        if (this.log) Logger[this.log](`EMBED - ${data}`);
        return channel.send({
          embeds: [
            new MessageEmbed()
              .setColor(this.color)
              .setTitle(this.defaultTitle)
              .setDescription(data)
          ]
        });
      } else {
        if (this.log)
          Logger[this.log](
            `Title: ${data.title || 'No Title'} | Description: ${
              data.description || 'No description'
            } `
          );
        return channel.send({
          embeds: [
            new MessageEmbed({ ...data })
              .setColor(this.color)
              .setTitle(data.title || this.defaultTitle)
          ]
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
}

export const error = new Embed(
  config.embed.errorcolor,
  'Error',
  LogLevels.ERROR
).create;
export const info = new Embed(config.embed.color, 'Info').create;
