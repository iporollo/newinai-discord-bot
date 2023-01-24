const Discord = require('discord.js');
const { GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Discord.Client({
  intents: [GatewayIntentBits.MessageContent],
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  console.log(message);
});

client.login(process.env.DISCORD_API_KEY);
