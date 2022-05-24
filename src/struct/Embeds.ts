import {
  ColorResolvable,
  Message,
  MessageEmbed,
} from 'discord.js';
import Logger from './Logger';
import { config } from '../config/config';
import { BotClient } from '../../struct/Client';

interface content {
  title: string,
  description: string
}

export function errorEmbed({title, description}:content, client: BotClient) {
  let embed = new MessageEmbed().setColor(config.embed.errorcolor)
  if (title) embed.setTitle(title)
  if (description) embed.setDescription(description)
  return {
    embeds: [
      embed
    ]
  }
}