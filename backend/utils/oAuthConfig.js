const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
   process.env.GOOGLE_CLIENT_ID,
   process.env.GOOGLE_CLIENT_SECRET,
   process.env.GOOGLE_REDIRECT_URI
);

function setCredentials(tokens) {
   oauth2Client.setCredentials({
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token
   });
}

async function getAccessToken() {
   const { token } = await oauth2Client.getAccessToken();
   return token;
}

module.exports = {
   oauth2Client,
   setCredentials,
   getAccessToken,
};
