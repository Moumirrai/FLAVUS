import { Document, Schema, model } from 'mongoose';

export interface IWhitelistModel extends Document {
  guildID: string;
  timestamp: Date;
}

export const WhitelistSchema = new Schema({
  guildID: {
    type: String,
    required: true,
    unique: true
  },
  timestamp: { type: Date, default: Date.now }
});

export const WhitelistModel = model<IWhitelistModel>(
  'WhitelistModel',
  WhitelistSchema,
  'WHITELIST_COLLECTION'
);
