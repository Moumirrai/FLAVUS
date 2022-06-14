import { Message, MessageEmbed } from 'discord.js';
import { Response } from 'express';
import { APIEndpoint } from 'flavus-api';
import { UserModel } from '../../models/userModel';

const UserEndpoint: APIEndpoint = {
  path: 'config',
  rateLimit: 0,
  async execute(client, req, res): Promise<any> {
    switch (req.headers.method) {
      case 'READ':
        await UserModel.findOne(
          { userID: req.session.user.id },
          (err, settings) => {
            if (err) return client.logger.error(err);
            if (!settings) {
              settings = new UserModel({
                userID: req.session.user.id,
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
        console.log(req.body);
        await UserModel.findOne(
          { userID: req.session.user.id },
          (err, settings) => {
            if (err) return client.logger.error(err);
            if (!settings) {
              settings = new UserModel({
                userID: req.session.user.id,
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
    }
  }
};

export default UserEndpoint;
