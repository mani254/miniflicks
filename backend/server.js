const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer')
const cron = require('node-cron');
const { yesterdayBookingCustomers } = require('./controllersClass/bookingController.js')
const sendMail = require('./utils/sendMail.js')
const reviewRequestHtml = require('./utils/reviewRequestHtml.js')

require('dotenv').config();

const app = express();

app.use(cors({ origin: [`${process.env.FRONTENDURI}`, "*"], credentials: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


mongoose.connect(process.env.MONGODB_URI)
   .then(() => console.log('MongoDB connected'))
   .catch(err => console.error('MongoDB connection error:', err));


app.use('/api', require('./routes/index.js'));

const sendDailyEmail = async () => {
   const customerEmails = await yesterdayBookingCustomers();

   console.log(customerEmails)

   if (customerEmails.length > 0) {
      await sendMail({
         subject: 'Review Request Miniflicks',
         html: reviewRequestHtml,
         to: customerEmails.join(',')
      });
   }
};

cron.schedule('00 10 * * *', async () => {
   try {
      await sendDailyEmail();
   } catch (error) {
      console.error('Error in daily email cron job:', error);
   }
}, {
   scheduled: true,
   timezone: "Asia/Kolkata"
});

app.use((err, req, res, next) => {
   if (err instanceof multer.MulterError) {
      // Handle multer-specific errors (like file size exceeded)
      return res.status(400).json({ error: err.message });
   } else if (err.message.includes('Invalid file type')) {
      // Handle custom file type errors
      return res.status(400).json({ error: err.message });
   } else if (err) {
      // Handle any other general errors
      return res.status(400).json({ error: err.message });
   }
   next();
});





const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});




