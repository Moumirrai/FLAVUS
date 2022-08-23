import { CommandArgs, iCommand } from 'flavus';
import { WhitelistModel } from '../models/whitelistModel';

const AutoplayCommand: iCommand = {
  name: 'whitelist',
  aliases: ['tester'],
  voiceRequired: false,
  joinPermissionRequired: false,
  playerRequired: false,
  sameChannelRequired: false,
  visible: false,
  description: 'Debug whitelist',
  usage: '<prefix>whitelist',
  async execute({ client, message, args }: CommandArgs): Promise<any> {
    if (message.author.id !== client.config.owner) return
    if (!args[0]) message.reply('No arguments were provided!');
    WhitelistModel.findOne({ guildID: args[0] }, (err, response) => {
      if (err) return client.logger.error(err);
      if (!response) {
        response = new WhitelistModel({
          guildID: args[0]
        });
        response.save().catch((err) => console.log(err));
        return message.react('👌').catch((e) => {});
      } else {
        if (args[1] === 'remove') {
          response.remove();
          return message.react('❌').catch((e) => {});
        } else {
          return message.reply('This guild is already in the whitelist!');
        }
      }
    });
  }
};

export default AutoplayCommand;
