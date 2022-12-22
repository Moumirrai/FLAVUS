import { Document, Schema, model } from 'mongoose';
import type { AuthResponse } from 'flavus-api';
import { config } from '../config/config';

export interface IAuthModel extends Document {
  code: string;
  id: string;
  auth: AuthResponse;
  createdAt: Date;
}

export const AuthSchema = new Schema({
  code: {
    type: String,
    required: true,
  },
  id: {
    type: String,
  },
  auth: {
    type: Object
  },
  createdAt: {
    type: Date,
    expires: config.loginExpire,
    default: Date.now,
    index: true
  }
});

export const AuthModel = model<IAuthModel>(
  'AuthModel',
  AuthSchema,
  'AUTH_COLLECTION'
);
