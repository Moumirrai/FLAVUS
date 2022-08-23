//create messageCreate event
import { Guild, Message, MessageEmbed } from 'discord.js';
import { iEvent } from 'flavus';
import { Player } from 'erela.js';
import { Core } from '../../struct/Core';
import { WhitelistModel } from '../../models/whitelistModel';

const GuildCreateEvent: iEvent = {
  name: 'guildCreate',
  async execute(client: Core, guild: Guild) {
    WhitelistModel.findOne({ guildID: guild.id }, (err, response) => {
      if (err) return client.logger.error(err);
      if (!response) {
        sendEmbed(
          guild,
          new MessageEmbed()
            .setColor(client.config.embed.errorcolor)
            .setTitle(`Guild ${guild.name} is not whitelisted`)
            .setDescription(
              `To add guild to whitelist contanct the owner of the bot <@${client.config.owner}>.`
            )
        );
        guild.leave();
      } else {
        sendEmbed(
          guild,
          new MessageEmbed()
            .setColor(client.config.embed.color)
            .setTitle(`Guild ${guild.name} is whitelisted`)
            .setDescription(
              `If you have any feedback or problems, please send it to the owner <@${client.config.owner}>, or open an issue on https://github.com/Moumirrai/FLAVUS/issues/new`
            )
        );
      }
    });
  }
};

async function sendEmbed(guild: Guild, embed: MessageEmbed) {
  guild.fetchAuditLogs({ type: 'BOT_ADD', limit: 1 }).then((log) => {
    log.entries
      .first()
      .executor.send({
        embeds: [embed]
      })
      .catch((e) => console.error(e));
  });
}

export default GuildCreateEvent;
