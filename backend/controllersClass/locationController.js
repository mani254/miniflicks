const Location = require('../schema/locationSchema');
const City = require('../schema/citySchema');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

class LocationController {
   constructor() {
      this.addLocation = this.addLocation.bind(this);
      this.getLocations = this.getLocations.bind(this);
      this.getLocation = this.getLocation.bind(this);
      this.updateLocation = this.updateLocation.bind(this);
      this.deleteLocation = this.deleteLocation.bind(this);
      this.changeLocationStatus = this.changeLocationStatus.bind(this);
      this.handleError = this.handleError.bind(this);
   }

   async addLocation(req, res) {
      try {
         const locationData = req.body;

         const adminValidationError = this.validateAdminData(locationData.admin);
         if (adminValidationError) return res.status(400).json(adminValidationError);

         const isUnique = await Location.isNameUniqueInCity(locationData.name, locationData.cityId);
         if (!isUnique) return res.status(400).json({ error: 'Location name already added in this city.' });

         locationData.image = this.handleImageUpload(req.file);
         locationData.addons = this.parseJSON(locationData.addons);
         locationData.gifts = this.parseJSON(locationData.gifts);

         locationData.admin.password = await this.hashPassword(locationData.admin.password);
         locationData.city = locationData.cityId;

         const location = new Location(locationData);
         const newLocation = await location.save();

         await this.updateCityWithNewLocation(locationData.cityId, newLocation._id);

         const populatedLocation = await Location.findById(newLocation._id).populate('city');
         return res.status(201).json({ message: "Location saved successfully", location: populatedLocation });
      } catch (error) {
         this.handleError(error, res);
      }
   }

   async getLocations(req, res) {
      try {
         let query = {}
         if (req.query.city) {
            query.city = req.query.city;
         }
         if (req.active) {
            query.status = true
         }
         let locations = []
         if (req.location) {
            locations = await Location.find({ _id: req.location }).populate('city');
         }
         else {
            locations = await Location.find(query).populate('city');
         }
         return res.status(200).json({ message: 'Locations fetched successfully', locations });
      } catch (error) {
         this.handleError(error, res);
      }
   }

   async getLocation(req, res) {
      let location = null
      const { id } = req.params

      if (req.location) {
         location = req.location
      }
      else {
         location = id
      }
      try {
         const locationData = await Location.findById(location).populate('city');
         return res.status(200).json({ message: 'single Location fetched successfully', location: locationData });
      } catch (error) {
         this.handleError(error, res);
      }
   }

   async updateLocation(req, res) {
      try {
         const { id } = req.params;
         const locationData = req.body;

         if (req.location) {
            if (req.location != id) {
               return res.status(401).json({ message: "You are not Authorized ot access this data" })
            }
         }

         const existingLocation = await Location.findById(id);
         if (!existingLocation) return res.status(404).json({ error: 'Location not found.' });

         if (!mongoose.Types.ObjectId.isValid(locationData.cityId)) {
            return res.status(400).json({ error: 'City is required' });
         }

         const isUnique = await Location.isNameUniqueInCity(locationData.name, locationData.cityId, id);
         if (!isUnique) return res.status(400).json({ error: 'Location name already added in this city.' });

         await this.deleteOldImage(existingLocation.image, req.file);

         locationData.image = this.handleImageUpload(req.file);
         locationData.addons = this.parseJSON(locationData.addons);
         locationData.gifts = this.parseJSON(locationData.gifts);

         locationData.admin.password = locationData.admin.password
            ? await this.hashPassword(locationData.admin.password)
            : existingLocation.admin.password;

         await this.updateCityReferences(existingLocation, locationData);

         locationData.city = locationData.cityId;
         existingLocation.set(locationData);
         const updatedLocation = await existingLocation.save();

         const populatedLocation = await Location.findById(updatedLocation._id).populate('city');
         return res.status(200).json({ message: 'Location updated successfully.', location: populatedLocation });
      } catch (error) {
         this.handleError(error, res);
      }
   }

   async deleteLocation(req, res) {
      try {
         const { id } = req.params;

         const existingLocation = await Location.findById(id);
         if (!existingLocation) return res.status(404).json({ error: 'Location not found.' });

         await this.updateCityReferencesOnDelete(existingLocation.city, id);
         await this.deleteOldImage(existingLocation.image);

         await Location.findByIdAndDelete(id);
         return res.status(200).json({ message: 'Location deleted successfully.' });
      } catch (error) {
         this.handleError(error, res);
      }
   }

   async changeLocationStatus(req, res) {
      try {
         const { id } = req.params;
         const { status } = req.body;

         const location = await Location.findById(id).populate('city');
         if (!location) return res.status(404).json({ error: 'Location not found.' });

         location.status = status;
         const updatedLocation = await location.save();

         return res.status(200).json({
            message: 'Location status updated successfully.',
            location: updatedLocation,
         });
      } catch (error) {
         this.handleError(error, res);
      }
   }

   // Helper Methods
   validateAdminData(admin) {
      if (!admin || !admin.name || !admin.email || !admin.number) {
         return { error: 'Admin data is incomplete.' };
      }
      return null;
   }

   async hashPassword(password) {
      return await bcrypt.hash(password, 10);
   }

   parseJSON(data) {
      return data ? JSON.parse(data) : [];
   }

   handleImageUpload(file) {
      return file ? `${process.env.BACKENDURI}/uploads/locations/${file.filename}` : null;
   }

   async deleteOldImage(imagePath, newFile = null) {
      if (imagePath) {
         const fileName = imagePath.slice(imagePath.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/locations', fileName);
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }
      }
   }

   async updateCityWithNewLocation(cityId, locationId) {
      const currentCity = await City.findById(cityId).populate('locations');
      currentCity.locations.push(locationId);
      await currentCity.save();
   }

   async updateCityReferences(existingLocation, locationData) {
      if (existingLocation.city.toString() !== locationData.cityId) {
         const oldCity = await City.findById(existingLocation.city);
         if (oldCity) {
            oldCity.locations = oldCity.locations.filter(loc => !loc.equals(existingLocation._id));
            await oldCity.save();
         }

         const newCity = await City.findById(locationData.cityId);
         if (newCity) {
            newCity.locations.push(existingLocation._id);
            await newCity.save();
         } else {
            throw new Error('New city not found.');
         }
      }
   }

   async updateCityReferencesOnDelete(cityId, locationId) {
      const city = await City.findById(cityId);
      if (city) {
         city.locations = city.locations.filter(loc => !loc.equals(locationId));
         await city.save();
      }
   }

   handleError(error, res) {
      if (error.code === 11000) {
         return res.status(400).json({ error: 'Phone Number already exists' });
      }
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
   }
}

module.exports = new LocationController();
