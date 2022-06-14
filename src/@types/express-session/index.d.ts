import type { SessionData } from 'express-session';
import type { BotConfig } from '../config/config';
import type { DiscordTogether } from 'discord-together';
import type { LavalinkHandler } from './structures/Music/LavalinkHandler';

interface UserInterface {
  id: string;
  username: string;
  avatar: string;
  avatar_decoration: any;
  discriminator: string;
  public_flags: number;
  flags: number;
  banner: any;
  banner_color: any;
  accent_color: any;
  locale: string;
  mfa_enabled: boolean;
}

declare module 'express-session' {
  export interface SessionData {
    code: string,
    user: UserInterface
  }
}
