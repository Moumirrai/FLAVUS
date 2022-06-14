import Cryptr from 'cryptr';
import { AuthModel, IAuthModel } from '../models/authModel';
const cryptr = new Cryptr(process.env.SECRET);
const DiscordOauth2 = require('discord-oauth2');
const oauth = new DiscordOauth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECTURI
});
import type { AuthRespose, UserInterface } from 'flavus-api';

export async function authUser(code: string) {
  try {
    const userAuth: IAuthModel = await AuthModel.findOne({
      code: code
    });
    if (userAuth) {
      if (
        userAuth.timestamp.getTime() + userAuth.auth.expires_in * 1000 <
        new Date().getTime()
      ) {
        const newCredentials: AuthRespose | null = await refreshToken(
          cryptr.decrypt(userAuth.auth.refresh_token)
        );
        if (newCredentials) {
          userAuth.auth = encrypt(newCredentials);
          userAuth.timestamp = new Date();
          await userAuth.save();
          return await getUser(newCredentials.access_token) || null;
        }
        return null;
      }
      return await getUser(cryptr.decrypt(userAuth.auth.access_token)) || null;
    }
    //new auth
    const newCredentials: AuthRespose | null = await newAuth(code);
    if (newCredentials) {
      const user = await getUser(newCredentials.access_token);
      if (user) {
        try {
          const newuserAuth: IAuthModel = await AuthModel.findOne({
            id: user.id
          });
          if (newuserAuth) {
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
            return user
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
    return null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function newAuth(code: string): Promise<AuthRespose | null> {
  return oauth
    .tokenRequest({
      code: code,
      scope: 'identify guilds',
      grantType: 'authorization_code'
    })
    .then((response: AuthRespose) => {
      return response;
    })
    .catch(function () {
      console.log('logging error');
      return null;
    });
}

function encrypt(auth: AuthRespose) {
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
): Promise<AuthRespose | null> {
  return oauth
    .tokenRequest({
      refreshToken: refresh_token,
      grantType: 'refresh_token',
      scope: 'identify guilds'
    })
    .then((response: AuthRespose) => {
      return response;
    })
    .catch(function () {
      console.log('logging error');
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
      console.log('logging error');
      return null;
    });
}