import Cryptr from 'cryptr';
const cryptr = new Cryptr(process.env.SECRET);
import { AuthModel, IAuthModel } from '../models/authModel';
import DiscordOauth2, { User as PartialUser } from 'discord-oauth2';
const oauth = new DiscordOauth2({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECTURI
});
import type { AuthResponse, userGuilds } from 'flavus-api';
import logger from '../struct/Logger';
import { Core } from '../struct/Core';
import { User } from 'discord.js';

export async function authUser(
  code: string,
  client: Core
): Promise<User | null> {
  try {
    const userAuth: IAuthModel | null = await AuthModel.findOne({ code });
    if (userAuth) {
      const currentTime = new Date().getTime();
      const { createdAt, auth } = userAuth;
      const { expires_in, access_token, refresh_token } = auth;

      if (createdAt.getTime() + expires_in * 1000 < currentTime) {
        const newCredentials: AuthResponse | null = await refreshToken(
          cryptr.decrypt(refresh_token)
        );

        if (!newCredentials) return null;

        const user = await getUser(newCredentials.access_token, client);

        if (!user) return null;

        userAuth.auth = encrypt(newCredentials);
        userAuth.createdAt = new Date();
        await userAuth.save();
        return user;
      }

      const user = await getUser(cryptr.decrypt(access_token), client);
      if (!user) return null;

      userAuth.createdAt = new Date();
      await userAuth.save();
      return user;
    }
    logger.log('new auth');
    const newCredentials: AuthResponse | null = await newAuth(code);
    if (!newCredentials) return null;
    const user = await getUser(newCredentials.access_token, client);
    if (!user) return null;

    const newuserAuth: IAuthModel = new AuthModel({
      code,
      id: user.id,
      auth: encrypt(newCredentials),
      createdAt: new Date()
    });

    await newuserAuth.save();
    return user;
  } catch (error) {
    logger.error(error.message);
    return null;
  }
}

/*
TODO: DELETE THIS
export async function authUser(
  code: string,
  client: Core
): Promise<User | null> {
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
    logger.log('new auth');
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
*/

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
  client: Core
): Promise<User | null> {
  return await oauth
    .getUser(token)
    .then(async (response: PartialUser) => {
      const id = response.id;
      const user = await client.users.fetch(id);
      if (!user) return null;
      return user;
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
  return {
    active: active,
    notActive: notActive
  };
}
