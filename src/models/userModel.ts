import { Document, Schema, model } from 'mongoose';

export interface IUserModel extends Document {
  userID: string;
  model: Object<Array>;
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
      titleBlacklist: [],
      authorBlacklist: [],
      uriBlacklist: [],
    }
  },
  timestamp: { type: Date, default: Date.now }
});

export const UserModel = model<IUserModel>(
  'UserModel',
  UserSchema,
  'USER_COLLECTION'
);
