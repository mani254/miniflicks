const jwt = require('jsonwebtoken');
const Admin = require('../schema/adminSchema');
const Location = require('../schema/locationSchema')


const authorization = async (req, res, next) => {
   const token = req.cookies?.authToken;

   console.log(token, 'token from the authorisation')

   if (!token) {
      return res.status(401).json({ error: 'No token provided in cookies' });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);


      if (decoded.superAdmin) {
         req.superAdmin = true;
         req.location = null;
         return next();
      }

      const location = await Location.findById(decoded.location);
      if (location) {
         req.superAdmin = false;
         req.location = location._id;
         return next();
      }

      return res.status(404).json({ error: 'User not found' });

   } catch (error) {
      if (error.name === 'TokenExpiredError') {
         return res.status(404).json({ error: 'Token expired, please log in again' });
      }

      return res.status(401).json({ error: 'Invalid token' });
   }
};

const superAdminAuth = async (req, res, next) => {
   const token = req.cookies?.authToken;

   console.log(token, 'token from the authorisation')

   if (!token) {
      return res.status(401).json({ error: 'No token provided in cookies' });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.superAdmin) {
         req.superAdmin = true;
         req.location = null;
         return next();
      }
      else {
         return res.status(404).json({ error: 'Not authorized to access data' });
      }

   } catch (error) {
      if (error.name === 'TokenExpiredError') {
         return res.status(404).json({ error: 'Token expired, please log in again' });
      }

      return res.status(401).json({ error: 'Invalid token' });
   }
};

module.exports = { authorization, superAdminAuth };
