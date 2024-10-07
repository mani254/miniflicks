const Location = require('../schema/locationSchema');
const City = require('../schema/citySchema');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config()


const addLocation = async (req, res) => {
   try {
      const locationData = req.body;

      let imageFileName = null;

      if (!locationData.admin || !locationData.admin.name || !locationData.admin.email || !locationData.admin.number) {
         return res.status(400).json({ error: 'Admin data is incomplete.' });
      }


      const isUnique = await Location.isNameUniqueInCity(locationData.name, locationData.cityId);

      if (!isUnique) {
         return res.status(400).json({ error: 'Location name already added in this city.' });
      }

      if (req.file) {
         imageFileName = `${process.env.BACKENDURI}/uploads/locations/${req.file.filename}`;
      }

      locationData.addons ? locationData.addons = JSON.parse(locationData.addons) : locationData.addons = []
      locationData.gifts ? locationData.gifts = JSON.parse(locationData.gifts) : locationData.gifts = []


      const hashedPassword = await bcrypt.hash(locationData.admin.password, 10);
      locationData.admin.password = hashedPassword;
      locationData.image = imageFileName;
      locationData.city = locationData.cityId


      const location = new Location(locationData);
      const newLocation = await location.save();

      const currentCity = await City.findById(locationData.cityId).populate('locations');
      currentCity.locations.push(newLocation._id);
      await currentCity.save();

      const populatedLocation = await Location.findById(newLocation._id).populate('city');

      return res.status(201).json({ message: "Location saved successfully", location: populatedLocation });
   } catch (error) {
      if (error.code === 11000) {
         return res.status(400).json({ error: 'Phone Number already exists' });
      }
      console.error('Error adding location:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const getLocations = async (req, res) => {
   try {
      const locations = await Location.find().populate('city');
      return res.status(200).json({ message: 'locations feteched succesfull', locations: locations });
   } catch (error) {
      console.error('Error getting locations:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
}

const updateLocation = async (req, res) => {
   try {
      const { id } = req.params;
      const locationData = req.body;

      const existingLocation = await Location.findById(id);
      if (!existingLocation) {
         return res.status(404).json({ error: 'Location not found.' });
      }

      if (!mongoose.Types.ObjectId.isValid(locationData.cityId)) {
         return res.status(400).json({ error: 'city is Required' })
      }

      const isUnique = await Location.isNameUniqueInCity(locationData.name, locationData.cityId, id);
      if (!isUnique) {
         return res.status(400).json({ error: 'Location name already added in this city.' });
      }

      if (req.file) {
         const fileName = existingLocation.image.slice(existingLocation.image.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/locations', fileName);
         console.log(oldImagePath, 'oldimagepath');
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }
         locationData.image = `${process.env.BACKENDURI}/uploads/locations/${req.file.filename}`;
      }
      else {
         locationData.image = null
      }

      locationData.addons ? locationData.addons = JSON.parse(locationData.addons) : locationData.addons = []
      locationData.gifts ? locationData.gifts = JSON.parse(locationData.gifts) : locationData.gifts = []

      if (locationData.admin.password) {
         const hashedPassword = await bcrypt.hash(locationData.admin.password, 10);
         locationData.admin.password = hashedPassword;
      } else {
         locationData.admin.password = existingLocation.admin.password;
      }

      if (existingLocation.city.toString() !== locationData.cityId) {

         const oldCity = await City.findById(existingLocation.city);
         if (oldCity) {
            oldCity.locations = oldCity.locations.filter(loc => !loc.equals(id));
            await oldCity.save();
         }

         const newCity = await City.findById(locationData.cityId);
         if (newCity) {
            newCity.locations.push(id);
            await newCity.save();
         } else {
            return res.status(404).json({ error: 'New city not found.' });
         }
      }

      locationData.city = locationData.cityId
      existingLocation.set(locationData);
      const updatedLocation = await existingLocation.save();

      // Populate the updated location with city data
      const populatedLocation = await Location.findById(updatedLocation._id).populate('city');

      return res.status(200).json({ message: 'Location updated successfully.', location: populatedLocation });

   } catch (error) {
      console.error('Error updating location:', error);
      return res.status(500).json({ message: 'Internal server error.' });
   }
};


const deleteLocation = async (req, res) => {
   try {
      const { id } = req.params;

      const existingLocation = await Location.findById(id);
      if (!existingLocation) {
         return res.status(404).json({ error: 'Location not found.' });
      }

      if (!mongoose.Types.ObjectId.isValid(existingLocation.city)) {
         const city = await City.findById(existingLocation.city);
         if (city) {
            city.locations = city.locations.filter(loc => !loc.equals(id));
            await city.save();
         }
      }


      if (existingLocation.image) {
         const fileName = existingLocation.image.slice(existingLocation.image.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/locations', fileName);
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }
      }

      await Location.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Location deleted successfully.' });
   } catch (error) {
      console.error('Error deleting location:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const changeLocationStatus = async (req, res) => {
   try {
      const { id } = req.params;
      const { status } = req.body;
      console.log(status)

      const location = await Location.findById(id).populate('city');
      if (!location) {
         return res.status(404).json({ error: 'Location not found.' });
      }

      location.status = status;
      const updatedLocation = await location.save();

      return res.status(200).json({
         message: 'Location status updated successfully.',
         location: updatedLocation,
      });
   } catch (error) {
      console.error('Error changing location status:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};


module.exports = { addLocation, updateLocation, getLocations, deleteLocation, changeLocationStatus }