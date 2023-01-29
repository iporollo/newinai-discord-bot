function extractLinks(text) {
  // Regular expression to match URLs
  var urlRegex = /(https?:\/\/[^\s]+)/g;

  // Find all matches in the text
  var matches = text.match(urlRegex);

  // Return the array of matches
  return matches;
}

async function getLastAirtableLink(airtableBase) {
  return new Promise((resolve, reject) => {
    airtableBase(process.env.AIRTABLE_LINK_AGGRETOR_TABLE_ID)
      .select({
        maxRecords: 1,
        sort: [{ field: 'created_at', direction: 'desc' }],
      })
      .firstPage(function (err, records) {
        if (err) {
          console.error(err);
          reject(err);
        }
        console.log(records);
        resolve(records);
      });
  });
}

async function saveEmbedToAirtable(airtableBase, embed) {
  return new Promise((resolve, reject) => {
    airtableBase(process.env.AIRTABLE_LINK_AGGRETOR_TABLE_ID).create(
      [
        {
          fields: {
            Link: embed.url,
            'Meta Tag Decription': embed.description,
            // TODO: Add open ai summary here
          },
        },
      ],
      function (err, records) {
        if (err) {
          console.error(err);
          reject(err);
        }
        console.log('Successfully saved', records);
        resolve(records);
      }
    );
  });
}

async function saveLinkToAirtable(airtableBase, link) {
  return new Promise((resolve, reject) => {
    airtableBase(process.env.AIRTABLE_LINK_AGGRETOR_TABLE_ID).create(
      [
        {
          fields: {
            Link: link,
          },
        },
      ],
      function (err, records) {
        if (err) {
          console.error(err);
          reject(err);
        }
        console.log('Successfully saved', records);
        resolve(records);
      }
    );
  });
}

module.exports = {
  extractLinks,
  saveEmbedToAirtable,
  saveLinkToAirtable,
  getLastAirtableLink,
};
