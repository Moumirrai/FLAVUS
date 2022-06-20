//import discord collection
const Collection = require('discord.js').Collection;


voiceCache = new Collection();

voiceCache.set('test', {'pepe': '123456'});

voiceCache.set('test2', 'pepe2');

voiceCache.get('test').bruh = true

voiceCache.delete('test')

console.log(voiceCache)