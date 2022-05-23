import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { APIEndpoint } from 'flavus-api';
import { UserModel } from '../models/userModel';

const AutoplayCommand: APIEndpoint = {
  path: 'blacklist',
  rateLimit: 0,
  async execute(client, req, res, user): Promise<any> {
    switch (req.headers.method) {
      case 'READ':
        await UserModel.findOne(
          { userID: user.id },
          (err, settings) => {
            if (err) return client.logger.error(err);
            if (!settings) {
              settings = new UserModel({
                userID: user.id,
                blacklist: []
              });
              settings.save().catch((err) => console.log(err));
              return res.json(settings.blacklist);
            } else {
              return res.json(settings.blacklist);
            }
          }
        ).clone().catch(function(err){ console.log(err)})
        break;
      case 'WRITE':
        await UserModel.findOne(
          { userID: user.id },
          (err, settings) => {
            if (err) return client.logger.error(err);
            if (!settings) {
              settings = new UserModel({
                userID: user.id,
                blacklist: req.body.list ? req.body.list : []
              });
              settings.save().catch((err) => console.log(err));
              return res.json({
                success: true,
                message: 'Blacklist updated'
              });
            } else {
              settings.blacklist = req.body.list ? req.body.list : []
              settings.save().catch((err) => console.log(err));
              return res.json({
                success: true,
                message: 'Blacklist updated'
              });
            }
          }
        ).clone().catch(function(err){ console.log(err)})
        break;
      default:
        return res.status(401).send('Invalid method')
      break;
    }
  }
};

export default AutoplayCommand;
