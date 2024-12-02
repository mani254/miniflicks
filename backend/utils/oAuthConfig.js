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
      // access_token: tokens.access_token
   });
}

// async function getAccessToken() {
//    const { token } = await oauth2Client.getAccessToken();
//    return token;
// }

async function getAccessToken() {
   try {
      
      const { token } = await oauth2Client.getAccessToken();
      console.log('New access token generated:', token);
      return token;
   } catch (error) {
      console.error('Error fetching access token:', error.message);
      // throw error; 
   }
}

module.exports = {
   oauth2Client,
   setCredentials,
   getAccessToken,
};
