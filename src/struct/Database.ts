import { GuildModel } from '../models/guildModel';

export async function getGuildConifg(
    guildID: string,
) {
    GuildModel.findOne({ guildID: message.guild.id }, (err, document) => {
        if (err) return client.logger.error(err);
        if (!document) {
            document = new GuildModel({
                guildID: message.guild.id,
            });
            return document
        } else {
            return document
        }
    });
}