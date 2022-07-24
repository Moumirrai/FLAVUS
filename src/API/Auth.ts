import Cryptr from 'cryptr';
import { AuthModel, IAuthModel } from '../models/authModel';
const cryptr = new Cryptr(process.env.SECRET);
const DiscordOauth2 = require('discord-oauth2');
const oauth = new DiscordOauth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECTURI
});
import type { AuthResponse, UserInterface } from 'flavus-api';
import logger from '../struct/Logger';

export async function authUser(code: string): Promise<UserInterface | null> {
  try {
    const userAuth: IAuthModel = await AuthModel.findOne({
      code: code
    });
    if (userAuth) {
      //if code is already in database
      if (
        userAuth.timestamp.getTime() + userAuth.auth.expires_in * 1000 <
        new Date().getTime()
      ) {
        //if access_token expired, use refresh_token
        const newCredentials: AuthResponse | null = await refreshToken(
          cryptr.decrypt(userAuth.auth.refresh_token)
        );
        if (newCredentials) {
          userAuth.auth = encrypt(newCredentials);
          userAuth.timestamp = new Date();
          await userAuth.save();
          return (await getUser(newCredentials.access_token)) || null;
        }
        return null;
      }
      return (
        (await getUser(cryptr.decrypt(userAuth.auth.access_token))) || null
      );
    }
    //new auth
    const newCredentials: AuthResponse | null = await newAuth(code);
    if (newCredentials) {
      //if code is valid
      const user = await getUser(newCredentials.access_token);
      if (user) {
        try {
          const newuserAuth: IAuthModel = await AuthModel.findOne({
            id: user.id
          });
          if (newuserAuth) {
            //if object with same id as new auth is already in database, overwrite it
            newuserAuth.code = code;
            newuserAuth.auth = encrypt(newCredentials);
            newuserAuth.timestamp = new Date();
            await newuserAuth.save();
            return user;
          } else {
            const newuserAuth: IAuthModel = new AuthModel({
              code: code,
              id: user.id,
              auth: encrypt(newCredentials),
              timestamp: new Date()
            });
            await newuserAuth.save();
            return user;
          }
        } catch (error) {
          logger.error(error);
        }
      }
    }
    return null;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

async function newAuth(code: string): Promise<AuthResponse | null> {
  return oauth
    .tokenRequest({
      code: code,
      scope: 'identify guilds voice',
      grantType: 'authorization_code'
    })
    .then((response: AuthResponse) => {
      return response;
    })
    .catch(function () {
      return null;
    });
}

function encrypt(auth: AuthResponse): AuthResponse {
  return {
    access_token: cryptr.encrypt(auth.access_token),
    refresh_token: cryptr.encrypt(auth.refresh_token),
    expires_in: auth.expires_in,
    scope: auth.scope,
    token_type: auth.token_type
  };
}

async function refreshToken(
  refresh_token: string
): Promise<AuthResponse | null> {
  return oauth
    .tokenRequest({
      refreshToken: refresh_token,
      grantType: 'refresh_token',
      scope: 'identify guilds voice'
    })
    .then((response: AuthResponse) => {
      return response;
    })
    .catch(function () {
      return null;
    });
}

export async function getUser(token: string): Promise<UserInterface | null> {
  return oauth
    .getUser(token)
    .then((response: UserInterface) => {
      return response;
    })
    .catch(function () {
      return null;
    });
}
