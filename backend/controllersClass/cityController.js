const City = require('../schema/citySchema');
const { ObjectId } = require('mongoose').Types;

class CityController {

   constructor() {
      this.getCities = this.getCities.bind(this)
      this.addCity = this.addCity.bind(this)
      this.deleteCity = this.deleteCity.bind(this)
      this.updateCity = this.updateCity.bind(this)
   }

   async addCity(req, res) {
      try {
         const { name, status } = req.body;

         const existed = await City.findOne({ name });
         if (existed) {
            return res.status(400).json({ error: "City already exists" });
         }

         const city = new City({ name, status });
         await city.save();
         res.status(200).json({ message: 'City added successfully', city });
      } catch (err) {
         this.handleError(err, res, 'Error while adding city');
      }
   }

   async getCities(req, res) {
      try {
         const query = {}
         if (req.active === true) {
            query.status = true
         }
         const cities = await City.find(query, { name: 1, status: 1, _id: 1 });
         res.status(200).send(cities);
      } catch (err) {
         console.error('Error while Adding City:', err.message);
         res.status(500).json({ error: 'Internal server error.' });
      }
   }

   async deleteCity(req, res) {
      try {
         const id = req.params.id;

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid city ID" });
         }

         const city = await City.findByIdAndDelete(id);
         if (!city) {
            return res.status(404).json({ error: "City does not exist" });
         }

         res.status(200).json({ message: 'City deleted successfully', city });
      } catch (err) {
         this.handleError(err, res, 'Error while deleting city');
      }
   }

   async updateCity(req, res) {
      try {
         const id = req.params.id;
         const { name, status } = req.body;

         if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid city ID" });
         }

         const city = await City.findById(id);
         if (!city) {
            return res.status(404).json({ error: "City does not exist" });
         }

         if (name) city.name = name;
         city.status = status;

         await city.save();
         res.status(200).json({ message: 'City updated successfully', city });
      } catch (err) {
         this.handleError(err, res, 'Error while updating city');
      }
   }

   handleError(err, res, message) {
      console.error(message + ':', err.message);
      res.status(500).json({ error: error.message });
   }
}

module.exports = new CityController();
