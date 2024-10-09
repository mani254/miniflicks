const Screen = require('../schema/screenSchema');
const Location = require('../schema/locationSchema');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const addScreen = async (req, res) => {
   try {
      const screenData = req.body;

      screenData.specifications = JSON.parse(screenData.specifications)
      screenData.slots = JSON.parse(screenData.slots)
      screenData.packages = JSON.parse(screenData.packages)


      if (!screenData.name || !screenData.capacity || !screenData.location || !screenData.minPeople) {
         return res.status(400).json({ error: 'Required fields are missing.' });
      }

      if (screenData.slots.length < 1) {
         return res.status(400).json({ error: 'Add atlest one Slot' });
      }

      if (screenData.specifications.length < 1) {
         return res.status(400).json({ error: 'Add atlest one Specification' });
      }

      if (screenData.packages.length < 1) {
         return res.status(400).json({ error: 'Add atleast one Package ' });
      }

      const imagePaths = [];
      if (req.files) {
         req.files.forEach(file => {
            imagePaths.push(`${process.env.BACKENDURI}/uploads/screens/${file.filename}`);
         });
      }

      screenData.images = imagePaths;
      const screen = new Screen(screenData);
      const newScreen = await screen.save();

      const existingLocation = await Location.findById(screenData.location);
      if (existingLocation) {
         existingLocation.screens.push(newScreen._id);
         await existingLocation.save();
      }

      return res.status(201).json({ message: 'Screen saved successfully', screen: newScreen });
   } catch (error) {
      console.error('Error adding screen:', error);
      return res.status(500).json({ error: error.message });
   }
};

const getScreens = async (req, res) => {
   try {
      const screens = await Screen.find()
         .populate('location', 'name _id')
         .populate('packages.addons')
         .populate('slots')
      return res.status(200).json({ message: 'Screens fetched successfully', screens });
   } catch (error) {
      console.error('Error getting screens:', error);
      return res.status(500).json({ error: error.message });
   }
};

const updateScreen = async (req, res) => {
   try {
      const { id } = req.params;
      const screenData = req.body;

      screenData.specifications = JSON.parse(screenData.specifications)
      screenData.slots = JSON.parse(screenData.slots)
      screenData.packages = JSON.parse(screenData.packages)


      if (!screenData.name || !screenData.capacity || !screenData.location || !screenData.minPeople) {
         return res.status(400).json({ error: 'Required fields are missing.' });
      }

      if (screenData.slots.length < 1) {
         return res.status(400).json({ error: 'Add atlest one Slot' });
      }

      if (screenData.specifications.length < 1) {
         return res.status(400).json({ error: 'Add atlest one Specification' });
      }

      if (screenData.packages.length < 1) {
         return res.status(400).json({ error: 'Add atleast one Package ' });
      }

      const existingScreen = await Screen.findById(id);
      if (!existingScreen) {
         return res.status(404).json({ error: 'Screen not found.' });
      }

      if (req.files) {
         existingScreen.images.forEach(async (imagePath) => {
            const fileName = imagePath.slice(imagePath.lastIndexOf('/') + 1);
            const oldImagePath = path.join(__dirname, '../public/uploads/screens', fileName);
            if (fs.existsSync(oldImagePath)) {
               fs.unlinkSync(oldImagePath);
            }
         });

         const newImagePaths = req.files.map(file => `${process.env.BACKENDURI}/uploads/screens/${file.filename}`);
         screenData.images = newImagePaths;
      }


      if (screenData.location && existingScreen.location.toString() !== screenData.location) {
         const oldLocation = await Location.findById(existingScreen.location);
         if (oldLocation) {
            oldLocation.screens = oldLocation.screens.filter(screenId => !screenId.equals(id));
            await oldLocation.save();
         }

         const newLocation = await Location.findById(screenData.location);
         if (newLocation) {
            newLocation.screens.push(id);
            await newLocation.save();
         } else {
            return res.status(404).json({ error: 'New location not found.' });
         }
      }

      existingScreen.set(screenData);
      const updatedScreen = await existingScreen.save();

      return res.status(200).json({ message: 'Screen updated successfully.', screen: updatedScreen });
   } catch (error) {
      console.error('Error updating screen:', error);
      return res.status(500).json({ error: error.message });
   }
};

const deleteScreen = async (req, res) => {
   try {
      const { id } = req.params;

      const existingScreen = await Screen.findById(id);
      if (!existingScreen) {
         return res.status(404).json({ error: 'Screen not found.' });
      }

      existingScreen.images.forEach(imagePath => {
         const fileName = imagePath.slice(imagePath.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/screens', fileName);
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }
      });

      const existingLocation = await Location.findById(existingScreen.location);
      if (existingLocation) {
         existingLocation.screens = existingLocation.screens.filter(screenId => !screenId.equals(id));
         await existingLocation.save();
      }

      await Screen.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Screen deleted successfully.' });
   } catch (error) {
      console.error('Error deleting screen:', error);
      return res.status(500).json({ error: error.message });
   }
};

const changeScreenStatus = async (req, res) => {
   try {
      const { id } = req.params;
      const { status } = req.body;

      const screen = await Screen.findById(id);
      if (!screen) {
         return res.status(404).json({ error: 'Screen not found.' });
      }

      screen.status = status;
      const updatedScreen = await screen.save();

      return res.status(200).json({
         message: 'Screen status updated successfully.',
         screen: updatedScreen,
      });
   } catch (error) {
      console.error('Error changing screen status:', error);
      return res.status(500).json({ error: error.message });
   }
};

module.exports = { addScreen, getScreens, updateScreen, deleteScreen, changeScreenStatus };
