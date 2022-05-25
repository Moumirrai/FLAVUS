import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { APIEndpoint } from 'flavus-api';
import { UserModel } from '../models/userModel';

const UserEndpoint: APIEndpoint = {
  path: 'user',
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
                model: {
                  blacklist: false,
                  titleBlacklist: [],
                  authorBlacklist: [],
                  uriBlacklist: [],
                },
              });
              settings.save().catch((err) => console.log(err));
              return res.json(settings.model);
            } else {
              return res.json(settings.model);
            }
          }
        ).clone().catch(function (err) { console.log(err) })
        break;
      case 'WRITE':
        await UserModel.findOne(
          { userID: user.id },
          (err, settings) => {
            if (err) return client.logger.error(err);
            if (!settings) {
              settings = new UserModel({
                userID: user.id,
                model: req.body.model ? req.body.model : {
                  blacklist: false,
                  titleBlacklist: [],
                  authorBlacklist: [],
                  uriBlacklist: [],
                },
              });
              settings.save().catch((err) => console.log(err));
              return res.json({
                success: true,
                message: 'Model updated'
              });
            } else {
              settings.model = req.body.model ? req.body.model : {
                blacklist: false,
                titleBlacklist: [],
                authorBlacklist: [],
                uriBlacklist: [],
              },
              settings.save().catch((err) => console.log(err));
              return res.json({
                success: true,
                message: 'Model updated'
              });
            }
          }
        ).clone().catch(function (err) { console.log(err) })
        break;
      default:
        return res.status(401).send('Invalid method')
        break;
    }
  }
};

export default UserEndpoint;
