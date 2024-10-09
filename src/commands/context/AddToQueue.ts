import {
  User,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
  Message,
  EmbedData
} from 'discord.js';
import { ContextCommand } from '../../types/Command';

const AddToQueue: ContextCommand = {
  builder: new ContextMenuCommandBuilder()
    .setName('Add to queue')
    // @ts-ignore
    .setType(ApplicationCommandType.Message),

  requirements: {
    voiceRequired: true,
    joinPermissionRequired: true,
  },

  context: async ({ interaction, core, channel }) => {
    if (!interaction.isMessageContextMenuCommand()) return;
    const target = interaction.targetMessage;
    const query = scanMessage(target);

    if (!query) return core.embeds.error(interaction, 'No url found!');

    const player = await core.PlayerManager.connect(
      interaction.channel,
      core.manager,
      channel
    );
    if (!player) {
      return core.embeds.error(interaction, 'Player failed to connect!');
    }
    try {
      const res = (await core.PlayerManager.search(query, player, {
        author: interaction.member.user as User,
        handleResult: true
      })) as EmbedData;
      if (!res) {
        throw new Error('No results were found!');
      }
      return core.embeds.info(interaction, res, false);
      //return message.channel.send(res);
    } catch (err) {
      return core.embeds.error(interaction, {
        title: 'Error while searching',
        description: err.message.toString()
      });
    }
  }
};

export default AddToQueue;

function scanMessage(target: Message<boolean>): string | undefined {
  if (target.attachments.size !== 0) {
    const attachment = target.attachments.first()
    const regex = /(audio|video)/gi;
    const testString = attachment.contentType;
    if (regex.test(testString)){
      //console.log(attachment);
      return attachment.url;
    } 
  }
  if (target.embeds.length !== 0) {
    if (target.embeds[0].url) return target.embeds[0].url;
    if (returnAllUrls(target.embeds[0]?.title)) {
      return returnAllUrls(target.embeds[0].title)[0];
    }
  }
  if (target.content) {
    if (returnAllUrls(target.content)) {
      return returnAllUrls(target.content)[0];
    }
  }
  return undefined;
}

function returnAllUrls(string: string) {
  const regex = /https?:\/\/[^\s]+/g;
  const urls = string.match(regex);
  return urls;
}
