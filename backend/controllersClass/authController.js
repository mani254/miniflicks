const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Admin = require('../schema/adminSchema.js');
const Location = require('../schema/locationSchema.js')


class AuthController {

   constructor() {
      this.login = this.login.bind(this);
      this.registerSuperAdmin = this.registerSuperAdmin.bind(this);
      this.initialLogin = this.initialLogin.bind(this);
      this.handleError = this.handleError.bind(this);
   }
   async login(req, res) {
      const { email, password } = req.body;

      const adminDetails = {
         name: "",
         email: "",
         superAdmin: false,
         password: '',
         location: ""
      }

      try {
         let admin = await Admin.findOne({ email });
         let location = null;

         if (admin) {
            const isPasswordValid = await bcrypt.compare(password, admin.password);
            if (!isPasswordValid) {
               return res.status(400).json({ error: 'Invalid email or password' });
            }

            adminDetails.name = admin.name;
            adminDetails.email = admin.email;
            adminDetails.superAdmin = true;
            adminDetails.location = null;
            adminDetails.password = admin.password
         } else {
            location = await Location.findOne({ 'admin.email': email });
            if (location) {
               const isPasswordValid = await bcrypt.compare(password, location.admin.password);
               if (!isPasswordValid) {
                  return res.status(400).json({ error: 'Invalid email or password' });
               }

               adminDetails.name = location.admin.name;
               adminDetails.email = location.admin.email;
               adminDetails.superAdmin = false;
               adminDetails.location = location._id;
               adminDetails.password = location.admin.password
            }
         }

         if (!admin && !location) {
            return res.status(404).json({ error: 'User not found' });
         }
         const token = jwt.sign(adminDetails, process.env.JWT_SECRET, { expiresIn: '3d' });
         res.status(200)
            .cookie("authToken", token, {
               httpOnly: true,
               sameSite: 'None',
               // sameSite: "Lax",
               secure: true,
            })
            .json({ message: "Logged in successfully", token, admin: adminDetails });

      } catch (error) {
         this.handleError(error, res, 'Error while logging in');
      }
   }

   async initialLogin(req, res) {
      const { token } = req.body
      const adminDetails = {
         name: '',
         email: '',
         location: '',
         password: ''
      }
      if (!token) {
         return res.status(401).json({ error: 'Invalid Token login Again' });
      }
      try {

         const decoded = jwt.verify(token, process.env.JWT_SECRET);

         if (!decoded) {
            return res.status(401).json({ error: 'login Expired Login again' });
         }

         adminDetails.name = decoded.name;
         adminDetails.email = decoded.email;
         adminDetails.superAdmin = decoded.superAdmin;
         adminDetails.location = decoded.location;
         adminDetails.password = decoded.password

         req.superAdmin = decoded.superAdmin
         req.location = decoded.location

         res.status(200)
            .cookie("authToken", token, {
               httpOnly: true,
               sameSite: 'None',
               // sameSite: "Lax",
               secure: true,
            })
            .json({ message: "Logged in successfully", token, admin: adminDetails });
      } catch (err) {
         if (err.name === 'TokenExpiredError') {
            return res.status(404).json({ error: 'Token expired, please log in again' });
         }

         return res.status(401).json({ error: 'Invalid token' });
      }
   }

   async registerSuperAdmin(req, res) {
      try {
         const { name, email, password } = req.body;

         if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
         }

         const existed = await Admin.findOne({ email });
         if (existed) {
            return res.status(409).json({ error: 'Email already exists.' });
         }

         const admin = new Admin({ name, email, password });
         await admin.save();

         res.status(201).json({ message: 'Admin created successfully', admin });

      } catch (err) {
         this.handleError(err, res, 'Error while registering superAdmin');
      }
   }

   handleError(err, res, message) {
      console.error(message + ':', err.message);
      res.status(500).json({ error: err.message });
   }
}

module.exports = AuthController