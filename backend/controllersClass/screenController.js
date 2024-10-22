const Screen = require('../schema/screenSchema');
const Location = require('../schema/locationSchema');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class ScreenController {
   constructor() {
      this.addScreen = this.addScreen.bind(this);
      this.getScreens = this.getScreens.bind(this);
      this.updateScreen = this.updateScreen.bind(this);
      this.deleteScreen = this.deleteScreen.bind(this);
      this.changeScreenStatus = this.changeScreenStatus.bind(this);
   }

   async addScreen(req, res) {
      try {
         const screenData = this.parseScreenData(req.body);

         if (req.location && req.location != screenData.location) {
            return res.status(401).json({ error: 'You are not authorized to access the data' })
         }

         if (!this.validateScreenData(screenData)) {
            return res.status(400).json({ error: 'Required fields are missing or invalid.' });
         }

         const imagePaths = this.handleImageUpload(req.files);
         screenData.images = imagePaths;

         const screen = new Screen(screenData);
         const newScreen = await screen.save();
         await this.updateLocationScreens(screenData.location, newScreen._id);
         const populatedScreen = await Screen.findById(newScreen._id).populate('location', "name _id");
         return res.status(200).json({ message: 'Screen added successfully.', screen: populatedScreen });
      } catch (error) {
         console.error('Error adding screen:', error);
         return res.status(500).json({ error: error.message });
      }
   }

   async getScreens(req, res) {
      try {
         let screens = []
         if (req.location) {
            screens = await Screen.find({ location: req.location })
               .populate('location', 'name _id')
               .populate('packages.addons')
               .populate('slots');
         } else {
            screens = await Screen.find()
               .populate('location', 'name _id')
               .populate('packages.addons')
               .populate('slots');
         }

         return res.status(200).json({ message: 'Screens fetched successfully', screens });
      } catch (error) {
         console.error('Error getting screens:', error);
         return res.status(500).json({ error: error.message });
      }
   }

   async updateScreen(req, res) {
      try {
         const { id } = req.params;
         const screenData = this.parseScreenData(req.body);

         if (req.location && req.location != screenData.location) {
            return res.status(401).json({ error: 'You are not authorized to access the data' })
         }

         if (!this.validateScreenData(screenData)) {
            return res.status(400).json({ error: 'Required fields are missing or invalid.' });
         }

         const existingScreen = await Screen.findById(id);
         if (!existingScreen) {
            return res.status(404).json({ error: 'Screen not found.' });
         }

         await this.handleImageDeletion(existingScreen.images);
         existingScreen.images = this.handleImageUpload(req.files) || existingScreen.images;

         if (screenData.location && existingScreen.location.toString() !== screenData.location) {
            await this.updateLocationOnScreenChange(existingScreen.location, screenData.location, id);
         }

         existingScreen.set(screenData);
         const updatedScreen = await existingScreen.save();

         const populatedScreen = await Screen.findById(updatedScreen._id).populate('location');
         return res.status(200).json({ message: 'Screen updated successfully.', screen: populatedScreen });
      } catch (error) {
         console.error('Error updating screen:', error);
         return res.status(500).json({ error: error.message });
      }
   }

   async deleteScreen(req, res) {
      try {
         const { id } = req.params;
         const existingScreen = await Screen.findById(id);
         if (!existingScreen) {
            return res.status(404).json({ error: 'Screen not found.' });
         }

         await this.handleImageDeletion(existingScreen.images);
         await this.updateLocationScreens(existingScreen.location, id, true);
         await Screen.findByIdAndDelete(id);
         return res.status(200).json({ message: 'Screen deleted successfully.' });
      } catch (error) {
         console.error('Error deleting screen:', error);
         return res.status(500).json({ error: error.message });
      }
   }

   async changeScreenStatus(req, res) {
      try {
         const { id } = req.params;
         const { status } = req.body;

         const screen = await Screen.findById(id);
         if (!screen) {
            return res.status(404).json({ error: 'Screen not found.' });
         }

         screen.status = status;
         const updatedScreen = await screen.save();

         const populatedScreen = await Screen.findById(updatedScreen._id).populate('location');
         return res.status(200).json({ message: 'Status updated successfully.', screen: populatedScreen });
      } catch (error) {
         console.error('Error changing screen status:', error);
         return res.status(500).json({ error: error.message });
      }
   }

   parseScreenData(screenData) {
      screenData.specifications = JSON.parse(screenData.specifications);
      screenData.slots = JSON.parse(screenData.slots);
      screenData.packages = JSON.parse(screenData.packages);
      return screenData;
   }

   validateScreenData(screenData) {
      return screenData.name && screenData.capacity && screenData.location && screenData.minPeople &&
         screenData.slots.length >= 1 && screenData.specifications.length >= 1 && screenData.packages.length >= 1;
   }

   handleImageUpload(files) {
      if (!files) return [];
      return files.map(file => `${process.env.BACKENDURI}/uploads/screens/${file.filename}`);
   }

   async handleImageDeletion(images) {
      for (const imagePath of images) {
         const fileName = imagePath.slice(imagePath.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/screens', fileName);
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }
      }
   }

   async updateLocationScreens(locationId, screenId, isDeleting = false) {
      const location = await Location.findById(locationId);
      if (location) {
         if (isDeleting) {
            location.screens = location.screens.filter(screenId => !screenId.equals(screenId));
         } else {
            location.screens.push(screenId);
         }
         await location.save();
      }
   }

   async updateLocationOnScreenChange(oldLocationId, newLocationId, screenId) {
      await this.updateLocationScreens(oldLocationId, screenId, true);
      await this.updateLocationScreens(newLocationId, screenId);
   }
}

module.exports = new ScreenController();
