import { APIEndpoint } from 'flavus-api';
import { UserModel, IUserModel } from '../../models/userModel';

const ConfigEndpoint: APIEndpoint = {
  path: 'config',
  async execute(client, req, res): Promise<Express.Response> {
    switch (req.headers.method) {
      case 'READ':
        await UserModel.findOne(
          { userID: req.session.user.id },
          (err, settings: IUserModel) => {
            if (err) return client.logger.error(err);
            if (!settings) {
              settings = new UserModel({
                userID: req.session.user.id,
                model: {
                  blacklist: false,
                  titleBlacklist: [],
                  authorBlacklist: [],
                  uriBlacklist: []
                }
              });
              settings.save().catch((err) => console.log(err));
              return res.json(settings.model);
            } else {
              return res.json(settings.model);
            }
          }
        )
          .clone()
          .catch(function (err) {
            console.log(err);
          });
        break;
      case 'WRITE':
        await UserModel.findOne(
          { userID: req.session.user.id },
          (err, settings) => {
            if (err) return client.logger.error(err);
            if (!settings) {
              settings = new UserModel({
                userID: req.session.user.id,
                model: req.body.model
                  ? req.body.model
                  : {
                      blacklist: false,
                      titleBlacklist: [],
                      authorBlacklist: [],
                      uriBlacklist: []
                    }
              });
              settings.save().catch((err) => console.log(err));
              return res.status(200).send('ok');
            } else {
              (settings.model = req.body.model
                ? req.body.model
                : {
                    blacklist: false,
                    titleBlacklist: [],
                    authorBlacklist: [],
                    uriBlacklist: []
                  }),
                settings.save().catch((err) => console.log(err));
              return res.status(200).send('ok');
            }
          }
        )
          .clone()
          .catch(function (err) {
            console.log(err);
          });
        break;
      default:
        return res.status(401).send('Invalid method');
    }
  }
};

export default ConfigEndpoint;
