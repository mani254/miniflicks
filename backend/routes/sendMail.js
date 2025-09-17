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
            pass: process.env.MAIL_API_KEY,
         },
      });

      const mailOptions = {
         from: '"Manikanta" <manikantadev254@gmail.com>',
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

const generateContactFormHtml = ({ name, phoneNo, email, message, country, service, description, budget }) => {
   return `<div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
     <div style="font-size: 24px; color: #333; text-align: center; margin-bottom: 20px;">
       New Contact Form Submission
     </div>
     <div style="font-size: 16px; line-height: 1.6; color: #555;">
       <p><strong>Name:</strong> ${name || "Not provided"}</p>
       <p><strong>Phone:</strong> ${phoneNo || "Not provided"}</p>
       <p><strong>Email:</strong> ${email || "Not provided"}</p>
       <p><strong>Country:</strong> ${country || "Not provided"}</p>
       <p><strong>Service:</strong> ${service || "Not provided"}</p>
       <p><strong>Budget:</strong> ${budget || "Not provided"}</p>
       <p><strong>Message:</strong>${description || "Not provided"}</p>
       <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
         ${message || "No message provided"}
       </p>
     </div>
     <div style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">
       This message was sent via your website's contact form.
     </div>
   </div>`;
};


async function sendContactMail(req, res) {
   const { name, phoneNo, email, message, country, service, description, budget } = req.body
   try {
      const template = generateContactFormHtml({ name, phoneNo, email, message, country, service, description, budget })

      await sendMail({
         subject: 'Manidev Contact Form', html: template, to: 'manifreelancer25@gmail.com'
      })

      res.status(200).send({ message: 'Form Submitted Successfully' })

   }
   catch (err) {
      console.error('Error while sendin contact form mail:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
}

module.exports = sendContactMail