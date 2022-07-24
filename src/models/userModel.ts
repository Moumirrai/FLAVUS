import { Document, Schema, model } from 'mongoose';

export interface Imodel {
  blacklist: Boolean;
  titleBlacklist: Array<String>;
  authorBlacklist: Array<String>;
  uriBlacklist: Array<String>;
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
