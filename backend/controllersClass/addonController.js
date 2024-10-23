const Addon = require('../schema/addonSchema');
const Location = require('../schema/locationSchema');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class AddonController {
   constructor() {
      this.addAddon = this.addAddon.bind(this);
      this.getAddons = this.getAddons.bind(this);
      this.updateAddon = this.updateAddon.bind(this);
      this.deleteAddon = this.deleteAddon.bind(this);
      this.changeAddonStatus = this.changeAddonStatus.bind(this);
      this.getAllAddons = this.getAllAddons.bind(this)
   }

   async addAddon(req, res) {
      try {
         const addonData = req.body;

         if (!addonData.name || !req.file) {
            return res.status(400).json({ error: 'Name, description, and image are required.' });
         }

         addonData.image = `${process.env.BACKENDURI}/uploads/addons/${req.file.filename}`;
         const addon = new Addon(addonData);
         const newAddon = await addon.save();

         return res.status(201).json({ message: "Addon added successfully", addon: newAddon });
      } catch (error) {
         this.handleError(error, res, 'Error adding addon');
      }
   }

   async getAddons(req, res) {
      const { search, limit = 10, page = 1, location } = req.query;
      const skip = (page - 1) * limit;

      try {
         let addonQuery = {};
         if (req.location) {
            const foundLocation = await Location.findById(req.location).select('addons');
            if (!foundLocation) {
               return res.status(404).json({ error: 'Location not found' });
            }
            addonQuery._id = { $in: foundLocation.addons };
         }
         else if (location) {
            const foundLocation = await Location.findById(location).select('addons');
            if (!foundLocation) {
               return res.status(404).json({ error: 'Location not found' });
            }
            addonQuery._id = { $in: foundLocation.addons };
         }

         if (search) {
            addonQuery.name = { $regex: search, $options: 'i' };
         }

         const addons = await Addon.find(addonQuery)
            .sort({ position: 1 })
            .skip(Number(skip))
            .limit(Number(limit));

         const totalDocuments = await Addon.countDocuments(addonQuery);

         return res.status(200).json({
            message: 'Addons fetched successfully',
            addons,
            totalDocuments,
         });
      } catch (error) {
         this.handleError(error, res, 'Error getting addons');
      }
   }

   async getAllAddons(req, res) {
      try {
         const addons = await Addon.find().sort({ position: 1 })

         return res.status(200).json({
            message: 'Addons fetched successfully',
            addons,
         });
      } catch (error) {
         this.handleError(error, res, 'Error getting addons');
      }
   }

   async updateAddon(req, res) {
      try {
         const { id } = req.params;
         const addonData = req.body;

         const existingAddon = await Addon.findById(id);
         if (!existingAddon) {
            return res.status(404).json({ error: 'Addon not found.' });
         }

         if (req.file) {
            const fileName = existingAddon.image.slice(existingAddon.image.lastIndexOf('/') + 1);
            const oldImagePath = path.join(__dirname, '../public/uploads/addons', fileName);

            if (fs.existsSync(oldImagePath)) {
               fs.unlinkSync(oldImagePath);
            }

            addonData.image = `${process.env.BACKENDURI}/uploads/addons/${req.file.filename}`;
         } else {
            addonData.image = existingAddon.image;
         }

         existingAddon.set(addonData);
         const updatedAddon = await existingAddon.save();

         return res.status(200).json({ message: 'Addon updated successfully.', addon: updatedAddon });
      } catch (error) {
         this.handleError(error, res, 'Error updating addon');
      }
   }

   async deleteAddon(req, res) {
      try {
         const { id } = req.params;

         const existingAddon = await Addon.findById(id);
         if (!existingAddon) {
            return res.status(404).json({ error: 'Addon not found.' });
         }

         await this.removeAddonFromLocations(id);
         const fileName = existingAddon.image.slice(existingAddon.image.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/addons', fileName);
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }

         await Addon.findByIdAndDelete(id);
         return res.status(200).json({ message: 'Addon deleted successfully.' });
      } catch (error) {
         this.handleError(error, res, 'Error deleting addon');
      }
   }

   async removeAddonFromLocations(addonId) {
      const locations = await Location.find({ addons: addonId });

      for (const location of locations) {
         location.addons = location.addons.filter(addon => !addon.equals(addonId));
         await location.save();
      }
   }

   async changeAddonStatus(req, res) {
      try {
         const { id } = req.params;
         const { status } = req.body;

         const addon = await Addon.findById(id);
         if (!addon) {
            return res.status(404).json({ error: 'Addon not found.' });
         }

         addon.status = status;
         const updatedAddon = await addon.save();

         return res.status(200).json({
            message: 'Addon status updated successfully.',
            addon: updatedAddon,
         });
      } catch (error) {
         this.handleError(error, res, 'Error changing addon status');
      }
   }

   handleError(error, res, context) {
      console.error(context, error);
      return res.status(500).json({ error: error.message });
   }
}

// Export a direct instance of AddonController
module.exports = new AddonController();
