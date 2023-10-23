import {
  EmbedBuilder,
  TextBasedChannel,
  ColorResolvable,
  Message,
  EmbedData,
  BaseMessageOptions,
  ChatInputCommandInteraction,
  InteractionResponse,
  ContextMenuCommandInteraction
} from 'discord.js';
import { config } from '../config';
import Logger, { LogLevels } from './Logger';

export enum Colors {
  DEFAULT = 0xffcc00,
  ERROR = 0xff0000,
}

export const build = (data: EmbedData, error?: boolean): BaseMessageOptions => {
  const embed = new EmbedBuilder({
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
    data?: EmbedData | string
  ): Promise<Message> => {
    try {
      if (typeof data === 'string') {
        if (this.log) Logger[this.log](`EMBED - ${data}`);
        return channel.send({
          embeds: [
            new EmbedBuilder()
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
            new EmbedBuilder({ ...data })
              .setColor(this.color)
              .setTitle(data.title || this.defaultTitle)
          ]
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  public createInt = (
    interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
    data: EmbedData | string,
    _ephemeral?: boolean
  ): Promise<InteractionResponse<boolean>> => {
    try {
      if (typeof data === 'string') {
        if (this.log) Logger[this.log](`EMBED:INTERACTION - ${data}`);
        return interaction.reply({
          ephemeral: _ephemeral === false ? false : true,
          embeds: [
            new EmbedBuilder()
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
        return interaction.reply({
          ephemeral: _ephemeral === false ? false : true,
          embeds: [
            new EmbedBuilder({ ...data })
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
).createInt;

export const info = new Embed(Colors.DEFAULT, 'Info').createInt;

export const message = {
  error: new Embed(Colors.ERROR, 'Error', LogLevels.ERROR).create,
  info: new Embed(Colors.DEFAULT, 'Info').create
};
