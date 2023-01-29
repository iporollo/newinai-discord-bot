const Airtable = require('airtable');
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const {
  extractLinks,
  saveEmbedToAirtable,
  saveLinkToAirtable,
  getLastAirtableLink,
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

client.on(Events.MessageReactionAdd, async (reaction, user) => {
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

  const emoji = reaction.emoji.name;
  const emojiAuthor = user.username;
  if (emoji === '📰' && emojiAuthor === 'iporollo') {
    let lastRecordLink = '';
    const recordsResult = await getLastAirtableLink(airtableBase);
    if (recordsResult?.length > 0) {
      lastRecordLink = recordsResult[0].get('Link');
    }
    if (reaction.message.embeds?.length > 0) {
      reaction.message.embeds.forEach(async (embed) => {
        if (!lastRecordLink || lastRecordLink !== embed.link) {
          await saveEmbedToAirtable(airtableBase, embed);
        }
      });
    } else {
      extractLinks(reaction.message.content).forEach(async (link) => {
        if (!lastRecordLink || lastRecordLink !== link) {
          await saveLinkToAirtable(airtableBase, link);
        }
      });
    }
  }
});

client.login(process.env.DISCORD_API_KEY);
