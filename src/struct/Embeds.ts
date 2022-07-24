import { MessageEmbed, MessageOptions } from 'discord.js';
import { config } from '../config/config';
/**
 * Creates an error embed
 * @returns {MessageOptions} embed
 */
export function error(title: string, content?: string): MessageOptions {
  return {
    embeds: [
      new MessageEmbed()
        .setColor(config.embed.errorcolor)
        .setTitle(title)
        .setDescription(content ? content : '')
    ]
  };
}

export function message(embed: MessageEmbed): MessageOptions {
  return { embeds: [embed.setColor(config.embed.color)] };
}
