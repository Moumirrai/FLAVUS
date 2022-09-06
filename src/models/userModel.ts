import { Document, Schema, model } from 'mongoose';

export interface Imodel {
  blacklist: boolean;
  titleBlacklist: Array<string>;
  authorBlacklist: Array<string>;
  uriBlacklist: Array<string>;
}

export interface IUserModel extends Document {
  userID: string;
  model: Imodel;
  timestamp: Date;
}

export const UserSchema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: true
  },
  model: {
    type: Object,
    default: {
      blacklist: false,
      titleBlacklist: [],
      authorBlacklist: [],
      uriBlacklist: []
    }
  },
  timestamp: { type: Date, default: Date.now }
});

export const UserModel = model<IUserModel>(
  'UserModel',
  UserSchema,
  'USER_COLLECTION'
);
