const City = require('../schema/citySchema')
const { ObjectId } = require('mongoose').Types;

const addCity = async (req, res) => {
   try {
      const { name, status } = req.body

      const existed = await City.findOne({ name })

      if (existed) {
         return res.status(400).json({ error: "City already exists" })
      }

      const city = new City({
         name,
         status
      })
      await city.save()
      res.status(200).json({ message: 'city Added SuccessFully', city });

   } catch (err) {
      console.error('Error while Adding City:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
}

const getCities = async (req, res) => {
   try {
      const cities = await City.find({}, { name: 1, status: 1, _id: 1 });
      res.status(200).send(cities);
   } catch (err) {
      console.error('Error while Adding City:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
}

const deleteCity = async (req, res) => {
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
      console.error('Error while deleting city:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
};

const updateCity = async (req, res) => {
   try {
      const id = req.params.id;
      const { name, status } = req.body;
      console.log(name, status)

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
      console.error('Error while updating city:', err.message);
      res.status(500).json({ error: 'Internal server error.' });
   }
};


module.exports = { addCity, getCities, deleteCity, updateCity }