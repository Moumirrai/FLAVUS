# Flavus

My personal music bot powered by lavalink. Based on [discord.js](https://discord.js.org/#/) and [erela.js](https://erelajs-docs.netlify.app/docs/gettingstarted.html#documentation-guides).

### Features
- can play music from **YouTube**, **Spotify**, **Twitch**, and more
- has autoplay feature


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
API=true
APIPORT=3030
```

# TODO

### - **FIX PLAYERMANAGER!!!**

- fix dashboard error handling

- fix sockets and sessions
- rework queue using (this)[https://guides.menudocs.org/topics/erelajs/advanced.html#extending]
- add 'start on timestamp' support
- create central functions that can be used from chat and dashbord e.g. play({query: string, id: string, voiceChannel: idk, options: any})
    - volume, play, search, loop, autoplay etc.
    - combine pause and resume to one function
- add equalizer
