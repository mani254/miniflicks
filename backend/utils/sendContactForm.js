const sendMail = require('./sendMail')

const generateContactFormHtml = ({ name, phone, email, message }) => {
   return `<div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
     <div style="font-size: 24px; color: #333; text-align: center; margin-bottom: 20px;">
       New Contact Form Submission
     </div>
     <div style="font-size: 16px; line-height: 1.6; color: #555;">
       <p><strong>Name:</strong> ${name || "Not provided"}</p>
       <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
       <p><strong>Email:</strong> ${email || "Not provided"}</p>
       <p><strong>Message:</strong></p>
       <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
         ${message || "No message provided"}
       </p>
     </div>
     <div style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">
       This message was sent via your website's contact form.
     </div>
   </div>`;
};

module.exports = generateContactFormHtml;


async function sendContactForm(req, res) {
   const { name, phone, email, message } = req.body
   try {
      const template = generateContactFormHtml({ name, phone, email, message })

      await sendMail({
         subject: 'Miniflicks Contact Form', html: template, to: 'msmanikanta25@gmail.com'
      })

      res.status(200).send({ message: 'Form Submitted Successfully' })

   }
   catch (err) {
      console.error('Error while sendin contact form mail:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
}

module.exports = sendContactForm