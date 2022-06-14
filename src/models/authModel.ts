import { Document, Schema, model } from 'mongoose';
import type { AuthRespose } from 'flavus-api';

export interface IAuthModel extends Document {
  code: String;
  id: String;
  auth: AuthRespose;
  timestamp: Date;
}

export const AuthSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  id: {
    type: String,
    required: false,
    unique: true
  },
  auth: {
    type: Object,
  },
  timestamp: { type: Date, default: Date.now }
});

export const AuthModel = model<IAuthModel>(
  'AuthModel',
  AuthSchema,
  'AUTH_COLLECTION'
);
