import { LavalinkManager } from '../../src/struct/Erela/LavalinkManager';
import { Node as ErelaNode, NodeOptions, Manager, Player } from 'magmastream';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Core from '../mocks/client';
import { config } from '../../src/config/config';
import { vi } from 'vitest';
import PlayerManager from '../../src/struct/PlayerManager';
import { Collection, time } from 'discord.js';

const nodes: NodeOptions[] = [
  {
    host: process.env.LAVALINK_HOST || 'localhost',
    port: parseInt(process.env.LAVALINK_PORT || '2333'),
    password: process.env.LAVALINK_PASSWORD,
    retryDelay: parseInt(process.env.LAVALINK_RETRY_DELAY || '5000'),
    secure: process.env.LAVALINK_SECURE === 'true',
    rest: process.env.LAVALINK_REST === 'true'
  }
];

const fn = vi.fn();
let manager: Manager;
const client = new Core()
let playerManager: PlayerManager;
let player: Player

async function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Lavalink Manager', () => {
  beforeAll(async () => {
    await client.loginTest()
    await new Promise((resolve) => setTimeout(resolve, 3000));
    playerManager = new PlayerManager(client);
  });
  afterAll(() => {
    client.destroy();
  });
  it('Connects to voice channel', async () => {
    if (global.RUNNING_TESTS) return console.log('Skipping test');
    global.RUNNING_TESTS = true;
    if (!process.env.TESTCHANNEL) throw new Error('No test channel provided');
    const channel = await client.channels.fetch('776802172020981795')
    if (!channel) throw new Error('No channel found');
    if (!channel.isVoiceBased()) throw new Error('Channel is not voice based');
    player = await playerManager.connect(channel, client.manager, channel)
    player.connect()
    expect(player).toBeDefined()
    console.log(player)
  });
  it('Searches for song', async () => {
    //const track = await client.manager.search('yt:what is love', client.user!.id);
    const res = await playerManager.search('never gonna give you up', player, {handleResult: true})
    console.log(res)
    /*
    if (!track) throw new Error('No track found');
    expect(track).toBeDefined();
    player.queue.add(track.tracks[0]);
    player.play()
    */
    await timeout(10000)
    /*
    manager = new Manager({
      nodes: nodes,
      send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
      shards: 1,
    });
    client.on('raw', (d) => {
      manager.updateVoiceState(d);
    });
    //wait 5 secont if node connects
    manager.on('nodeConnect', (node: ErelaNode) => {
      console.log('node connected');
      console.log(node);
      fn(node);
    });

    //log every event on manager

    manager.on('nodeError', (node, error) => {
      console.log(
        `Node "${node.options.identifier}" encountered an error: ${error.message}.`
      );
    });
    //await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(manager.nodes.get('lavalink.flavus.xyz'));
    //await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log(fn.mock.calls);
    console.log(manager.nodes.get('lavalink.flavus.xyz')?.connect());
    */
  });
});
