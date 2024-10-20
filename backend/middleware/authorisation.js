const jwt = require('jsonwebtoken');
const Admin = require('../schema/adminSchema');
const Location = require('../schema/locationSchema')


const authorize = async (req, res, next) => {
   const token = req.cookies?.token;

   if (!token) {
      return res.status(401).json({ message: 'No token provided in cookies' });
   }

   try {
      const decoded = jwt.verify(error, process.env.JWT_SECRET);

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

      return res.status(401).json({ error: 'Invalid token', error });
   }
};

module.exports = authorize;
