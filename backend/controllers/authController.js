const Admin = require('../models/adminSchema.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const authController = {
   loginAdmin: async (req, res) => {
      try {
         const { email, password } = req.body;

         const existingAdmin = await Admin.findOne({ email });
         if (existingAdmin) {
            const passwordMatch = await bcrypt.compare(password, existingAdmin.password);

            if (passwordMatch) {
               const token = jwt.sign({ adminId: existingAdmin._id, superAdmin: existingAdmin.isAdmin }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRY });
               res.cookie("token", token, { httpOnly: true });
               return res.status(200).json({ message: "Login successful", token, admin: existingAdmin });
            } else {
               return res.status(401).json({ error: "Invalid credentials" });
            }
         }
         return res.status(404).json({ error: "Admin not found" });
      } catch (error) {
         console.error("Error logging as Admin:", error);
         return res.status(500).json({ error: "Could not log in Admin. Please try again later." });
      }
   },

   registerAdmin: async (req, res) => {
      try {
         const { username, password, email, locations } = req.body;

         const existingAdmin = await Admin.findOne({ email });

         if (existingAdmin) {
            return res.status(402).json({ error: "Email Already existed" });
         }

         const newAdmin = new Admin({
            username,
            password,
            email,
         });


         if (locations.includes('All')) {
            newAdmin.superAdmin = true;
            newAdmin.locations = []
         }

         await newAdmin.save();

         return res.status(201).json({ message: "Admin created successfully.", admin: newAdmin });
      } catch (error) {
         console.error("Error adding admin:", error);
         return res.status(500).json({ error: "Could not add admin. Please try again later." });
      }
   }
};

module.exports = authController;
