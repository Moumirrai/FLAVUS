import { Document, Schema, model } from 'mongoose';

export interface IGuildModel extends Document {
  guildID: string;
  volume: number;
  autoplay: boolean;
  timestamp: Date;
}

export const GuildSchema = new Schema({
  guildID: {
    type: String,
    required: true,
    unique: true
  },
  volume: {
    type: Number,
    default: 100
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  timestamp: { type: Date, default: Date.now }
});

export const GuildModel = model<IGuildModel>(
  'GuildModel',
  GuildSchema,
  'GUILD_COLLECTION'
);
