# Flavus

Discord music bot powered by Lavalink. Based on [discord.js](https://discord.js.org/#/) and [erela.js](https://erelajs-docs.netlify.app/docs/gettingstarted.html#documentation-guides). Provides an rest/socket API through which remote control is possible (e.g. web client).

[![DeepSource](https://app.deepsource.com/gh/Moumirrai/FLAVUS.svg/?label=active+issues&show_trend=true&token=s08kSy0CWD7NO4ryOxLjZieN)](https://app.deepsource.com/gh/Moumirrai/FLAVUS/?ref=repository-badge)

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
CLIENT_ID=<CLIENT_ID>
CLIENT_SECRET=<CLIENT_SECRET>
REDIRECTURI=http://localhost:3000/
PREFIX=<BOT_PREFIX>
LEAVE_ON_EMPTY_CHANNEL=<TIME_IN_SECONDS>
SAVELOGS=<BOOLEAN> # whether to save logs to a file
DEBUGMODE=<BOOLEAN> # whether to print bebug messages
 
# Shard config
SHARD_COUNT=1 # Sharding is not supported at the moment!!!

# Lavalink credentials
LAVALINK_HOST=<LAVALINK_HOST>
LAVALINK_PORT=<LAVALINK_PORT>
LAVALINK_PASSWORD=<LAVALINK_PASSWORD>
LAVALINK_REST=<BOOLEAN> # whether to use the new lavalink rest api
LAVALINK_SECURE=<BOOLEAN>
LAVALINK_RETRY_DELAY=5000

# Lavalink client config
CLIENT_NAME=Flavus
CLIENT_VERSION=1.0.0

# Mongodb config
MONGODB_SRV=<MONGODB_SRV>

# Spotify config
SPOTIFY_ID=<SHOULD_NOT_BE_NEEDED>
SPOTIFY_SECRET=<SHOULD_NOT_BE_NEEDED>

# Api
API=false # if you don't need the api, set this to false
APIPORT=3030
SECRET=<SEED_FOR_CRYPTR>
METRICS_TOKEN=<WHATEVER_RANDOM_STRING> # auth code for the metrics endpoint
```

# TODO

After a socket is disconnected, it is removed from its rooms, but they are not cleared from the cache because the socket no longer references it. Fix!!

- [ ] fix sockets and sessions
- [ ] fix dashboard error handling
- [ ] rewrite search command, currently it is a mess
- [ ] maybe add equalizer