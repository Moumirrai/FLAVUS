import Cryptr from 'cryptr';
import { AuthModel, IAuthModel } from '../models/authModel';
const cryptr = new Cryptr(process.env.SECRET);
import DiscordOauth2 = require('discord-oauth2');
const oauth = new DiscordOauth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECTURI
});
import type { AuthResponse, userGuilds, UserInterface } from 'flavus-api';
import logger from '../struct/Logger';
import { Core } from '../struct/Core';
export async function authUser(
  code: string,
  client: Core
): Promise<UserInterface | null> {
  try {
    const userAuth: IAuthModel = await AuthModel.findOne({
      code: code
    });
    if (userAuth) {
      //if code is already in database
      if (
        userAuth.createdAt.getTime() + userAuth.auth.expires_in * 1000 <
        new Date().getTime()
      ) {
        //if access_token expired, use refresh_token
        const newCredentials: AuthResponse | null = await refreshToken(
          cryptr.decrypt(userAuth.auth.refresh_token)
        );
        if (newCredentials) {
          const user = await getUser(newCredentials.access_token, client);
          if (!user) return null;
          userAuth.auth = encrypt(newCredentials);
          userAuth.createdAt = new Date();
          await userAuth.save();
          return user;
        }
        return null;
      }
      //if access_token is still valid
      const user = await getUser(
        cryptr.decrypt(userAuth.auth.access_token),
        client
      );
      if (user) {
        userAuth.createdAt = new Date();
        await userAuth.save();
        return user;
      }
      return null;
    }
    console.log('new auth');
    //new auth
    const newCredentials: AuthResponse | null = await newAuth(code);
    if (newCredentials) {
      //if code is valid
      const user = await getUser(newCredentials.access_token, client);
      //console.log(user);
      if (user) {
        try {
          const newuserAuth: IAuthModel = new AuthModel({
            code: code,
            id: user.id,
            auth: encrypt(newCredentials),
            createdAt: new Date()
          });
          await newuserAuth.save();
          return user;
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
    .catch((err) => {
      console.log(err);
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
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function getUser(
  token: string,
  client
): Promise<UserInterface | null> {
  return await oauth
    .getUser(token)
    .then(async (response: UserInterface) => {
      response.guilds = await getGuilds(token, client);
      //TODO:remove this
      //console.log(response);
      return response;
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
}

export async function getGuilds(
  token: string,
  client
): Promise<userGuilds | null> {
  const response = await oauth.getUserGuilds(token);
  if (!response) {
    logger.error('Error getting guilds');
    return null;
  }
  const owned = response.filter((guild) => guild.owner);
  const notActive =
    owned.filter((guild) => !client.guilds.cache.has(guild.id)) || [];
  const active =
    owned.filter((guild) => client.guilds.cache.has(guild.id)) || [];
  //TODO:remove this
  //console.log(active);
  return {
    active: active,
    notActive: notActive
  };

  return oauth
    .getUserGuilds(token)
    .then((response: DiscordOauth2.PartialGuild[]) => {
      const owned = response.filter((guild) => guild.owner);
      const notActive =
        owned.filter((guild) => !client.guilds.cache.has(guild.id)) || [];
      const active =
        owned.filter((guild) => client.guilds.cache.has(guild.id)) || [];
      //TODO:remove this
      //console.log(active);
      return {
        active: active,
        notActive: notActive
      };
    })
    .catch((err) => {
      console.log(err);
      return null;
    });
}
