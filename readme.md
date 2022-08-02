# Flavus

Discord music bot powered by Lavalink. Based on [discord.js](https://discord.js.org/#/) and [erela.js](https://erelajs-docs.netlify.app/docs/gettingstarted.html#documentation-guides). Provides an rest/socket API through which remote control is possible (e.g. web client).

## Features
- can play music from **YouTube**, **Spotify**, **Twitch**, and more
- has decent autoplay
- lots of useful features, like playing on timestamp from YouTube
- API for controlls

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
SSL=<BOOLEAN>   # if set to true, but no valit certificates are found, switches to false
CERT_PATH=<PATH_TO_YOUR_CERTIFICATES>   # if not provided, uses the "cert" folder in the process root folder
```

# TODO

- [ ] fix dashboard error handling
- [ ] fix sockets and sessions
- [ ] ?rework queue using [this](https://guides.menudocs.org/topics/erelajs/advanced.html#extending)
- [x] add 'start on timestamp' support
- create central functions that can be used from chat and dashbord
    - [x] search
    - [x] play
    - [ ] autoplay
    - [ ] loop
    - [ ] volume
- [ ] combine pause and resume to one function
- [ ] maybe add equalizer
