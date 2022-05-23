import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { APIEndpoint } from 'flavus-api';
import { GuildModel } from '../models/guildModel';

const AutoplayCommand: APIEndpoint = {
  path: 'debug',
  rateLimit: 0,
  async execute(client, req, res, user): Promise<any> {
    await GuildModel.findOne(
      { guildID: req.query.id },
      (err, settings) => {
        if (err) return client.logger.error(err);
        if (!settings) {
            return res.status(200).json({
                success: false,
                message: 'No settings found'
            });
        } else {
            return res.json(settings);
        }
      }
    ).clone().catch(function(err){ console.log(err)})
  }
};

export default AutoplayCommand;
