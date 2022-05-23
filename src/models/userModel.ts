import { Document, Schema, model } from 'mongoose';

export interface IUserModel extends Document {
  userID: string;
  blacklist: Array<string>;
  timestamp: Date;
}

export const UserSchema = new Schema({
  userID: {
    type: String,
    required: true,
    unique: true
  },
  blacklist: {
    type: Array,
    default: []
  },
  timestamp: { type: Date, default: Date.now }
});

export const UserModel = model<IUserModel>(
  'UserModel',
  UserSchema,
  'USER_COLLECTION'
);
