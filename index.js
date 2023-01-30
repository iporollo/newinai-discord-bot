const Airtable = require('airtable');
const { Client, Events, GatewayIntentBits, Partials } = require('discord.js');
const { getLinkPreview } = require('link-preview-js');
const {
  extractLinks,
  saveLinkToAirtable,
  getLastAirtableLink,
} = require('./utils');
const fetch = require('node-fetch');
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
  // for testing
  if (emoji === '🚀' && emojiAuthor === 'iporollo') {
    // if (emoji === '📰' && emojiAuthor === 'iporollo') {
    let lastRecordLink = '';
    let savedRecords;
    const recordsResult = await getLastAirtableLink(airtableBase);
    if (recordsResult?.length > 0) {
      lastRecordLink = recordsResult[0].get('Link');
    }
    if (reaction.message.embeds?.length > 0) {
      const embeds = reaction.message.embeds;
      for (let i = 0; i < embeds.length; i++) {
        if (!lastRecordLink || lastRecordLink !== embeds[i].url) {
          savedRecords = await saveLinkToAirtable(
            airtableBase,
            embeds[i].url,
            embeds[i].description
          );
        }
      }
    } else {
      const extractedLinks = extractLinks(reaction.message.content);
      for (let i = 0; i < extractedLinks.length; i++) {
        if (!lastRecordLink || lastRecordLink !== extractedLinks[i]) {
          const l = await getLinkPreview(extractedLinks[i]);
          const description = l?.description || l?.title || '';
          savedRecords = await saveLinkToAirtable(
            airtableBase,
            extractedLinks[i],
            description
          );
        }
      }
    }

    if (savedRecords && savedRecords.length > 0) {
      try {
        const savedRecord = savedRecords[0];
        await fetch(process.env.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_KEY,
          },
          body: JSON.stringify({
            link: savedRecord.get('Link'),
            description: savedRecord.get('Meta Tag Decription'),
            airtableRecordId: savedRecord.id,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
});

client.login(process.env.DISCORD_API_KEY);
