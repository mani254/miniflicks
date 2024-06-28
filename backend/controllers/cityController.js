const City = require('../models/citySchema.js');

const cityController = {

   createCity: async (req, res) => {
      try {
         const { name, status } = req.body;
         console.log(name, status)
         const image = `images/cities/${req.file.filename}`;
         console.log(req.file.path)
         const city = new City({ name, image, status });
         await city.save();
         res.status(201).json(city);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   getCities: async (req, res) => {
      try {
         const cities = await City.find();
         res.json(cities);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   getCityById: async (req, res) => {
      try {
         const city = await City.findById(req.params.id);
         if (!city) {
            return res.status(404).json({ error: 'City not found' });
         }
         res.json(city);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   updateCity: async (req, res) => {
      try {
         let { name, image, status } = req.body;

         if (req?.file?.filename) {
            image = `images/cities/${req.file.filename}`;
         }

         console.log(name, image, status)
         const city = await City.findByIdAndUpdate(req.params.id, { name, image, status }, { new: true });
         if (!city) {
            return res.status(404).json({ error: 'City not found' });
         }
         res.json(city);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   deleteCity: async (req, res) => {
      try {
         const city = await City.findByIdAndDelete(req.params.id);
         if (!city) {
            return res.status(404).json({ error: 'City not found' });
         }
         res.json({ message: 'City deleted successfully' });
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   updateCityStatus: async (req, res) => {
      try {
         const { status } = req.body;
         const city = await City.findByIdAndUpdate(req.params.id, { status }, { new: true });
         if (!city) {
            return res.status(404).json({ error: 'City not found' });
         }
         res.json(city);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   getActiveCities: async (req, res) => {
      try {
         const cities = await City.find({ status: true });
         res.json(cities);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },
   
   getCityWithPopulatedLocations: async (req, res) => {
      try {
         const city = await City.findById(req.params.id).populate('locations');
         if (!city) {
            return res.status(404).json({ error: 'City not found' });
         }
         res.json(city);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   }

};

module.exports = cityController;
