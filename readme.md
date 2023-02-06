# Flavus

Discord music bot powered by Lavalink. Based on [discord.js](https://discord.js.org/#/) and [erela.js](https://erelajs-docs.netlify.app/docs/gettingstarted.html#documentation-guides). Provides an rest/socket API through which remote control is possible (e.g. web client).

## Features
- can play music from **YouTube**, **Spotify***, **Twitch**, and more
- has decent autoplay
- lots of useful features, like playing on timestamp from YouTube
- API for controlls

\* spotify tracks are resolved to YouTube links  

### Lavalink server and MongoDB instance required
 If you dont want to host your own Lavalink use these settings in `.env`:
 ```env
LAVALINK_HOST = lavalink.eu
LAVALINK_PORT = 2333
LAVALINK_PASSWORD = Raccoon
LAVALINK_SECURE = false
 ```

## Configuration

Create `.env` file or set your env variables as follows:
```env
# Bot config
TOKEN=<YOUR_DISCORD_BOT_TOKEN>
OWNER=<OWNER_DISCORD_ID>
PREFIX=<PREFIX>
LEAVE_ON_EMPTY_CHANNEL=<TIME_IN_SECONDS>
DEBUGMODE=<BOOLEAN>     # whether to print bebug messages
SAVELOGS=<BOOLEAN>

# Lavalink credentials
LAVALINK_HOST=<LAVALINK_HOST>
LAVALINK_PORT=<LAVALINK_PORT>
LAVALINK_PASSWORD=<LAVALINK_PASSWORD>
LAVALINK_SECURE=<BOOLEAN>
LAVALINK_RETRY_DELAY=5000

# Lavalink client config
CLIENT_NAME=Lavalink
CLIENT_VERSION=1.0.0

# Mongodb config
MONGODB_SRV=<MONGODB_SRV>

# Spotify config
SPOTIFY_ID=<SPOTIFY_CLIENT_ID>
SPOTIFY_SECRET=<SPOTIFY_CLIENT_SECRET>

# Genius credentials (optional)
GENIUS = <GENIUS_CLIENT_ID>

# API Config
API=<BOOLEAN>   # the settings below are required only if this is true
APIPORT=3030
SECRET=<SEED_FOR_CRYPTR>
```

# TODO

After a socket is disconnected, it is removed from its rooms, but they are not cleared from the cache because the socket no longer references it. Fix!!

- [ ] fix sockets and sessions

- [ ] fix dashboard error handling
- [ ] combine pause and resume to one function
- [ ] maybe add equalizer
