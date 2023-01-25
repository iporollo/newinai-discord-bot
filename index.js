const Airtable = require('airtable');
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const {
  extractLinks,
  saveEmbedToAirtable,
  saveLinkToAirtable,
} = require('./utils');
require('dotenv').config();

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const airtableBase = Airtable.base(process.env.AIRTABLE_BASE_ID);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Reaction],
});

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.MessageReactionAdd, async (reaction) => {
  // When a reaction is received, check if the structure is partial
  if (reaction.partial) {
    // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
    try {
      await reaction.fetch();
    } catch (error) {
      console.error('Something went wrong when fetching the message:', error);
      // Return as `reaction.message.author` may be undefined/null
      return;
    }
  }

  console.log('reaction', reaction);

  const emoji = reaction.emoji.name;
  const emojiCount = reaction.count;
  const emojiAuthor = reaction.message.author.username;
  if (emoji === '📰' && emojiCount === 1 && emojiAuthor === 'iporollo') {
    if (reaction.message.embeds?.length > 0) {
      reaction.message.embeds.forEach((embed) => {
        saveEmbedToAirtable(airtableBase, embed);
      });
    } else {
      extractLinks(reaction.message.content).forEach((link) => {
        saveLinkToAirtable(airtableBase, link);
      });
    }
  }
});

client.login(process.env.DISCORD_API_KEY);
