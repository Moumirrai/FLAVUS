import { GuildModel } from '../models/guildModel';
import logger from './Logger';

export default class mongo {
  public static async getGuildConfig(guildID: string) {
    GuildModel.findOne({ guildID: guildID }, (err, document) => {
      if (err) return logger.error(err);
      if (!document) {
        document = new GuildModel({
          guildID: guildID
        });
        return document;
      } else {
        return document;
      }
    });
  }
}
