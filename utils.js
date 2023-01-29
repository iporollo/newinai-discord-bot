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

async function saveLinkToAirtable(airtableBase, url, description) {
  return new Promise((resolve, reject) => {
    airtableBase(process.env.AIRTABLE_LINK_AGGRETOR_TABLE_ID).create(
      [
        {
          fields: {
            Link: url,
            'Meta Tag Decription': description,
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
  saveLinkToAirtable,
  getLastAirtableLink,
};
