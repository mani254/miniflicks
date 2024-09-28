const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
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

app.use((err, req, res, next) => {
   console.error(err.stack);
   res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});

