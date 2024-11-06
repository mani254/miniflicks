const jwt = require('jsonwebtoken');
const Location = require('../schema/locationSchema')


const authorization = async (req, res, next) => {
   const token = req.cookies?.authToken;

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


   if (!token) {
      return res.status(401).json({ error: 'UnAuthorized access' });
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

const userAuth = async (req, res, next) => {
   const token = req.cookies?.authToken;
   try {
      if (!token) {
         req.active = true
         req.superAdmin = null
         req.location = null;
         return next()
      }

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

   } catch (error) {
      return res.status(500).json({ error: 'Internal Error' });
   }
}



module.exports = { authorization, superAdminAuth, userAuth };
