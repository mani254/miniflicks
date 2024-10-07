const Addon = require('../schema/addonSchema');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const addAddon = async (req, res) => {
   try {
      const addonData = req.body;

      if (!addonData.name || !req.file) {
         return res.status(400).json({ error: 'Name, description, and image are required.' });
      }

      const imageFileName = `${process.env.BACKENDURI}/uploads/addons/${req.file.filename}`;
      addonData.image = imageFileName;

      const addon = new Addon(addonData);
      const newAddon = await addon.save();

      return res.status(201).json({ message: "Addon added successfully", addon: newAddon });
   } catch (error) {
      console.error('Error adding addon:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const getAddons = async (req, res) => {
   try {
      const addons = await Addon.find().sort({ position: 1 });
      return res.status(200).json({ message: 'Addons fetched successfully', addons });
   } catch (error) {
      console.error('Error getting addons:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const updateAddon = async (req, res) => {
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
      console.error('Error updating addon:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const deleteAddon = async (req, res) => {
   try {
      const { id } = req.params;

      const existingAddon = await Addon.findById(id);
      if (!existingAddon) {
         return res.status(404).json({ error: 'Addon not found.' });
      }

      const fileName = existingAddon.image.slice(existingAddon.image.lastIndexOf('/') + 1);
      const oldImagePath = path.join(__dirname, '../public/uploads/addons', fileName);
      if (fs.existsSync(oldImagePath)) {
         fs.unlinkSync(oldImagePath);
      }

      await Addon.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Addon deleted successfully.' });
   } catch (error) {
      console.error('Error deleting addon:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const changeAddonStatus = async (req, res) => {
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
      console.error('Error changing addon status:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

module.exports = { addAddon, getAddons, updateAddon, deleteAddon, changeAddonStatus };
