// const { gmail } = require("googleapis/build/src/apis/gmail");
const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendMail({ subject, html, to }) {
   try {
      const transporter = nodemailer.createTransport({
         host: "smtp-relay.brevo.com",
         port: 587,
         secure: false,
         auth: {
            user: "81f12a001@smtp-brevo.com",
            pass: process.env.SIB_API_KEY,
         },
      });


      const mailOptions = {
         from: 'manikantadev254@gmail.com',
         to: to,
         subject: subject,
         html: html,
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.response);
   } catch (error) {
      console.error('Error sending email:', error);
   }
}

module.exports = sendMail;


// const Sib = require("sib-api-v3-sdk");
// require("dotenv").config();

// const client = Sib.ApiClient.instance;

// const apiKey = client.authentications["api-key"];
// apiKey.apiKey = process.env.SIB_API_KEY;

// if (!apiKey.apiKey) {
//    console.error("Error: Missing Sendinblue API key. Please check your .env file.");
//    process.exit(1);
// }

// const tranEmailApi = new Sib.TransactionalEmailsApi();

// const sender = {
//    email: process.env.SENDER_EMAIL || "manikantadev254@gmail.com",
//    name: "Manikanta",
// };

// const receivers = [
//    {
//       email: process.env.RECEIVER_EMAIL || "msmanikanta25@gmail.com",
//    },
// ];

// tranEmailApi
//    .sendTransacEmail({
//       sender,
//       to: receivers,
//       subject: "This is the subject",
//       textContent: "This is the text",
//    })
//    .then((response) => {
//       console.log("Mail sent successfully:", response);
//    })
//    .catch((err) => {
//       console.error("Error sending mail:", err.response?.body || err.message);
//    });

