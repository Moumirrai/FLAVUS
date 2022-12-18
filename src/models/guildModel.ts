import { Document, Schema, model } from 'mongoose';

export interface IGuildModel extends Document {
  guildID: string;
  volume: number;
  autoplay: {
    active: boolean;
    mode: "yt" | "spotify";
  }
  timestamp: Date;
  statusChannel: {
    name: string;
    id: string;
  };
}

export const GuildSchema = new Schema({
  guildID: {
    type: String,
    required: true,
    unique: true
  },
  volume: {
    type: Number,
    default: 70
  },
  autoplay: {
    active: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: "yt"
    }
  },
  statusChannel: {
    name: {
      type: String
    },
    id: {
      type: String
    }
  },
  timestamp: { type: Date, default: Date.now }
});

export const GuildModel = model<IGuildModel>(
  'GuildModel',
  GuildSchema,
  'GUILD_COLLECTION'
);
