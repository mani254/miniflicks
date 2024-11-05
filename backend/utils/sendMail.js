const nodemailer = require('nodemailer');
const { oauth2Client, getAccessToken } = require('./oauthConfig');
require('dotenv').config();

async function sendMail({ subject, html, to }) {
   try {
      oauth2Client.setCredentials({
         refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
      const accessToken = await getAccessToken();
      const transporter = nodemailer.createTransport({
         service: 'gmail',
         auth: {
            type: 'OAuth2',
            user: process.env.GOOGLE_EMAIL,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken,
         },
      });
      const mailOptions = {
         from: process.env.GOOGLE_EMAIL,
         to: to,
         subject: subject,
         html: html
      };
      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent...', result);
   } catch (error) {
      console.error('Error sending email:', error);
   }
}

module.exports = sendMail;