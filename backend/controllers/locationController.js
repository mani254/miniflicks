const Location = require('../models/locationSchema');

const locationController = {
   createLocation: async (req, res) => {
      try {
         const { name, status, address, city, location } = req.body;

         const image = `images/locations/${req.file.filename}`

         const newLocation = new Location({
            name,
            image,
            status,
            address,
            city,
            location
         });
         await newLocation.save();
         res.status(201).json({ message: 'Location added successfully', location: newLocation });
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Internal server error' });
      }
   },
   updateLocation: async (req, res) => {
      try {
         let { name, status, address, city, location, image } = req.body;

         if (req?.file?.filename) {
            image = `images/locations/${req.file.filename}`;
         }

         console.log(name, status, address, city, location, image)

         const locationData = await Location.findByIdAndUpdate(req.params.id, { name, image, status, address }, { new: true });
         if (!locationData) {
            return res.status(404).json({ error: 'Location not found' });
         }
         res.json({ location: locationData });
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   getLocations: async (req, res) => {
      try {
         const locations = await Location.find();
         res.json(locations);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   getLocationById: async (req, res) => {
      try {
         const location = await Location.findById(req.params.id);
         if (!location) {
            return res.status(404).json({ error: 'Location not found' });
         }
         res.json(location);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },



   deleteLocation: async (req, res) => {
      try {
         const location = await Location.findByIdAndDelete(req.params.id);
         if (!location) {
            return res.status(404).json({ error: 'Location not found' });
         }
         res.json({ message: 'Location deleted successfully' });
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   updateLocationStatus: async (req, res) => {
      try {
         const { status } = req.body;
         const location = await Location.findByIdAndUpdate(req.params.id, { status }, { new: true });
         if (!location) {
            return res.status(404).json({ error: 'Location not found' });
         }
         res.json(location);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   getActiveLocations: async (req, res) => {
      try {
         const locations = await Location.find({ status: true });
         res.json(locations);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },
   

   getLocationsWithPopulatedScreens: async (req, res) => {
      try {
         const locations = await Location.find().populate('screens');
         res.json(locations);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   }

};

module.exports = locationController;
