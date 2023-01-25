function extractLinks(text) {
  // Regular expression to match URLs
  var urlRegex = /(https?:\/\/[^\s]+)/g;

  // Find all matches in the text
  var matches = text.match(urlRegex);

  // Return the array of matches
  return matches;
}

function saveEmbedToAirtable(airtableBase, embed) {
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
      }
      console.log('Successfully saved', records);
    }
  );
}

function saveLinkToAirtable(airtableBase, link) {
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
      }
      console.log('Successfully saved', records);
    }
  );
}

module.exports = { extractLinks, saveEmbedToAirtable, saveLinkToAirtable };
