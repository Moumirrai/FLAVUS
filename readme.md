# Flavus

My personal music bot powered by lavalink. Based on [discord.js](https://discord.js.org/#/) and [erela.js](https://erelajs-docs.netlify.app/docs/gettingstarted.html#documentation-guides).

### Features
- can play music from **YouTube**, **Spotify**, **Twitch**, and more
- has command to launch discord watchtogether activity
- stores settings in MongoDB database


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

# Lavalink credentials
LAVALINK_HOST=<LAVALINK_HOST>
LAVALINK_PORT=<LAVALINK_PORT>
LAVALINK_PASSWORD=<LAVALINK_PASSWORD>
LAVALINK_SECURE=true

# Mongodb config
MONGODB_SRV=<MONGODB_SRV>

# Spotify config
SPOTIFY_ID=<SPOTIFY_CLIENT_ID>
SPOTIFY_SECRET=<SPOTIFY_CLIENT_SECRET>

# Genius credentials (optional)
GENIUS = <GENIUS_CLIENT_ID>
```
