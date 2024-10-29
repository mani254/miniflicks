const Occasion = require('../schema/occasionSchema');
const Location = require('../schema/locationSchema');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class OccasionController {
   constructor() {
      this.addOccasion = this.addOccasion.bind(this);
      this.getOccasions = this.getOccasions.bind(this);
      this.updateOccasion = this.updateOccasion.bind(this);
      this.deleteOccasion = this.deleteOccasion.bind(this);
      this.changeOccasionStatus = this.changeOccasionStatus.bind(this);
      this.getAllOccasions = this.getAllOccasions.bind(this);
   }

   async addOccasion(req, res) {
      try {
         const occasionData = req.body;

         if (!occasionData.name || !req.file) {
            return res.status(400).json({ error: 'Name, description, and image are required.' });
         }

         occasionData.image = `${process.env.BACKENDURI}/uploads/occasions/${req.file.filename}`;
         const occasion = new Occasion(occasionData);
         const newOccasion = await occasion.save();

         return res.status(201).json({ message: "Occasion added successfully", occasion: newOccasion });
      } catch (error) {
         this.handleError(error, res, 'Error adding occasion');
      }
   }

   async getOccasions(req, res) {
      const { search, limit = 10, page = 1, location } = req.query;
      const skip = (page - 1) * limit;

      try {
         let occasionQuery = {};
         if (req.location) {
            const foundLocation = await Location.findById(req.location).select('occasions');
            if (!foundLocation) {
               return res.status(404).json({ error: 'Location not found' });
            }
            occasionQuery._id = { $in: foundLocation.occasions };
         } else if (location) {
            const foundLocation = await Location.findById(location).select('occasions');
            if (!foundLocation) {
               return res.status(404).json({ error: 'Location not found' });
            }
            occasionQuery._id = { $in: foundLocation.occasions };
         }

         if (search) {
            occasionQuery.name = { $regex: search, $options: 'i' };
         }

         const occasions = await Occasion.find(occasionQuery)
            .sort({ position: 1 })
            .skip(Number(skip))
            .limit(Number(limit));

         const totalDocuments = await Occasion.countDocuments(occasionQuery);

         return res.status(200).json({
            message: 'Occasions fetched successfully',
            occasions,
            totalDocuments,
         });
      } catch (error) {
         this.handleError(error, res, 'Error getting occasions');
      }
   }

   async getAllOccasions(req, res) {
      try {
         const occasions = await Occasion.find().sort({ position: 1 });

         return res.status(200).json({
            message: 'Occasions fetched successfully',
            occasions,
         });
      } catch (error) {
         this.handleError(error, res, 'Error getting occasions');
      }
   }

   async updateOccasion(req, res) {
      try {
         const { id } = req.params;
         const occasionData = req.body;

         const existingOccasion = await Occasion.findById(id);
         if (!existingOccasion) {
            return res.status(404).json({ error: 'Occasion not found.' });
         }

         if (req.file) {
            const fileName = existingOccasion.image.slice(existingOccasion.image.lastIndexOf('/') + 1);
            const oldImagePath = path.join(__dirname, '../public/uploads/occasions', fileName);

            if (fs.existsSync(oldImagePath)) {
               fs.unlinkSync(oldImagePath);
            }

            occasionData.image = `${process.env.BACKENDURI}/uploads/occasions/${req.file.filename}`;
         } else {
            occasionData.image = existingOccasion.image;
         }

         existingOccasion.set(occasionData);
         const updatedOccasion = await existingOccasion.save();

         return res.status(200).json({ message: 'Occasion updated successfully.', occasion: updatedOccasion });
      } catch (error) {
         this.handleError(error, res, 'Error updating occasion');
      }
   }

   async deleteOccasion(req, res) {
      try {
         const { id } = req.params;

         const existingOccasion = await Occasion.findById(id);
         if (!existingOccasion) {
            return res.status(404).json({ error: 'Occasion not found.' });
         }

         await this.removeOccasionFromLocations(id);
         const fileName = existingOccasion.image.slice(existingOccasion.image.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/occasions', fileName);
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }

         await Occasion.findByIdAndDelete(id);
         return res.status(200).json({ message: 'Occasion deleted successfully.' });
      } catch (error) {
         this.handleError(error, res, 'Error deleting occasion');
      }
   }

   async removeOccasionFromLocations(occasionId) {
      const locations = await Location.find({ occasions: occasionId });

      for (const location of locations) {
         location.occasions = location.occasions.filter(occasion => !occasion.equals(occasionId));
         await location.save();
      }
   }

   async changeOccasionStatus(req, res) {
      try {
         const { id } = req.params;
         const { status } = req.body;

         const occasion = await Occasion.findById(id);
         if (!occasion) {
            return res.status(404).json({ error: 'Occasion not found.' });
         }

         occasion.status = status;
         const updatedOccasion = await occasion.save();

         return res.status(200).json({
            message: 'Occasion status updated successfully.',
            occasion: updatedOccasion,
         });
      } catch (error) {
         this.handleError(error, res, 'Error changing occasion status');
      }
   }

   handleError(error, res, context) {
      console.error(context, error);
      return res.status(500).json({ error: error.message });
   }
}

// Export a direct instance of OccasionController
module.exports = new OccasionController();
