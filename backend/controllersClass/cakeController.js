const Cake = require('../schema/cakeSchema');
const Location = require('../schema/locationSchema');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class CakeController {

   constructor() {
      this.addCake = this.addCake.bind(this);
      this.getCakes = this.getCakes.bind(this);
      this.updateCake = this.updateCake.bind(this);
      this.deleteCake = this.deleteCake.bind(this);
      this.changeCakeStatus = this.changeCakeStatus.bind(this);
      this.getAllCakes = this.getAllCakes.bind(this);
   }

   async addCake(req, res) {
      try {
         const cakeData = req.body;

         if (!cakeData.name || !req.file) {
            return res.status(400).json({ error: 'Name, description, and image are required.' });
         }

         cakeData.image = `${process.env.BACKENDURI}/uploads/cakes/${req.file.filename}`;
         const cake = new Cake(cakeData);
         const newCake = await cake.save();

         return res.status(201).json({ message: "Cake added successfully", cake: newCake });
      } catch (error) {
         this.handleError(error, res, 'Error adding cake');
      }
   }

   async getCakes(req, res) {
      const { search, limit = 10, page = 1, location } = req.query;
      const skip = (page - 1) * limit;

      try {
         let cakeQuery = {};
         if (req.location) {
            const foundLocation = await Location.findById(req.location).select('cakes');
            if (!foundLocation) {
               return res.status(404).json({ error: 'Location not found' });
            }
            cakeQuery._id = { $in: foundLocation.cakes };
         } else if (location) {
            const foundLocation = await Location.findById(location).select('cakes');
            if (!foundLocation) {
               return res.status(404).json({ error: 'Location not found' });
            }
            cakeQuery._id = { $in: foundLocation.cakes };
         }

         if (search) {
            cakeQuery.name = { $regex: search, $options: 'i' };
         }

         const cakes = await Cake.find(cakeQuery)
            .sort({ position: 1 })
            .skip(Number(skip))
            .limit(Number(limit));

         const totalDocuments = await Cake.countDocuments(cakeQuery);

         return res.status(200).json({
            message: 'Cakes fetched successfully',
            cakes,
            totalDocuments,
         });
      } catch (error) {
         this.handleError(error, res, 'Error getting cakes');
      }
   }

   async getAllCakes(req, res) {
      try {
         const cakes = await Cake.find().sort({ position: 1 });

         return res.status(200).json({
            message: 'Cakes fetched successfully',
            cakes,
         });
      } catch (error) {
         this.handleError(error, res, 'Error getting cakes');
      }
   }

   async updateCake(req, res) {
      try {
         const { id } = req.params;
         const cakeData = req.body;

         const existingCake = await Cake.findById(id);
         if (!existingCake) {
            return res.status(404).json({ error: 'Cake not found.' });
         }

         if (req.file) {
            const fileName = existingCake.image.slice(existingCake.image.lastIndexOf('/') + 1);
            const oldImagePath = path.join(__dirname, '../public/uploads/cakes', fileName);

            if (fs.existsSync(oldImagePath)) {
               fs.unlinkSync(oldImagePath);
            }

            cakeData.image = `${process.env.BACKENDURI}/uploads/cakes/${req.file.filename}`;
         } else {
            cakeData.image = existingCake.image;
         }

         existingCake.set(cakeData);
         const updatedCake = await existingCake.save();

         return res.status(200).json({ message: 'Cake updated successfully.', cake: updatedCake });
      } catch (error) {
         this.handleError(error, res, 'Error updating cake');
      }
   }

   async deleteCake(req, res) {
      try {
         const { id } = req.params;

         const existingCake = await Cake.findById(id);
         if (!existingCake) {
            return res.status(404).json({ error: 'Cake not found.' });
         }

         await this.removeCakeFromLocations(id);
         const fileName = existingCake.image.slice(existingCake.image.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/cakes', fileName);
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }

         await Cake.findByIdAndDelete(id);
         return res.status(200).json({ message: 'Cake deleted successfully.' });
      } catch (error) {
         this.handleError(error, res, 'Error deleting cake');
      }
   }

   async removeCakeFromLocations(cakeId) {
      const locations = await Location.find({ cakes: cakeId });

      for (const location of locations) {
         location.cakes = location.cakes.filter(cake => !cake.equals(cakeId));
         await location.save();
      }
   }

   async changeCakeStatus(req, res) {
      try {
         const { id } = req.params;
         const { status } = req.body;

         const cake = await Cake.findById(id);
         if (!cake) {
            return res.status(404).json({ error: 'Cake not found.' });
         }

         cake.status = status;
         const updatedCake = await cake.save();

         return res.status(200).json({
            message: 'Cake status updated successfully.',
            cake: updatedCake,
         });
      } catch (error) {
         this.handleError(error, res, 'Error changing cake status');
      }
   }

   handleError(error, res, context) {
      console.error(context, error);
      return res.status(500).json({ error: error.message });
   }
}


module.exports = new CakeController();
