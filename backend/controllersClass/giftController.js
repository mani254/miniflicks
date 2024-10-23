const Gift = require('../schema/giftSchema');
const Location = require('../schema/locationSchema')
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class GiftController {
   constructor() {
      this.addGift = this.addGift.bind(this);
      this.getGifts = this.getGifts.bind(this);
      this.updateGift = this.updateGift.bind(this);
      this.deleteGift = this.deleteGift.bind(this);
      this.changeGiftStatus = this.changeGiftStatus.bind(this);
      this.getAllGifts = this.getAllGifts.bind(this)
   }

   async addGift(req, res) {
      try {
         const giftData = req.body;

         if (!giftData.name || !req.file) {
            return res.status(400).json({ error: 'Name, description, and image are required.' });
         }

         giftData.image = `${process.env.BACKENDURI}/uploads/gifts/${req.file.filename}`;
         const gift = new Gift(giftData);
         const newGift = await gift.save();

         return res.status(201).json({ message: "Gift added successfully", gift: newGift });
      } catch (error) {
         this.handleError(error, res, 'Error adding gift');
      }
   }

   async getGifts(req, res) {

      const { search, limit = 10, page = 1, location } = req.query;
      const skip = (page - 1) * limit;

      try {
         let giftQuery = {};

         if (req.location) {
            const foundLocation = await Location.findById(req.location).select('gifts');
            if (!foundLocation) {
               return res.status(404).json({ error: 'Location not found' });
            }
            giftQuery._id = { $in: foundLocation.gifts };
         } else if (location) {
            const foundLocation = await Location.findById(location).select('gifts');
            if (!foundLocation) {
               return res.status(404).json({ error: 'Location not found' });
            }
            giftQuery._id = { $in: foundLocation.gifts };
         }

         if (search) {
            giftQuery.name = { $regex: search, $options: 'i' };
         }

         const gifts = await Gift.find(giftQuery)
            .sort({ position: 1 })
            .skip(Number(skip))
            .limit(Number(limit));

         const totalDocuments = await Gift.countDocuments(giftQuery);

         return res.status(200).json({
            message: 'Gifts fetched successfully',
            gifts,
            totalDocuments,
         })
      } catch (error) {
         this.handleError(error, res, 'Error getting gifts');
      }
   }

   async getAllGifts(req, res) {
      try {
         const gifts = await Gift.find({}).sort({ position: 1 })
         return res.status(200).json({
            message: 'Gifts fetched successfully',
            gifts,
         })
      }
      catch (err) {
         this.handleError(error, res, 'Error getting gifts');
      }
   }

   async updateGift(req, res) {
      try {
         const { id } = req.params;
         const giftData = req.body;

         const existingGift = await Gift.findById(id);
         if (!existingGift) {
            return res.status(404).json({ error: 'Gift not found.' });
         }

         if (req.file) {
            await this.deleteImage(existingGift.image);
            giftData.image = `${process.env.BACKENDURI}/uploads/gifts/${req.file.filename}`;
         } else {
            giftData.image = existingGift.image;
         }

         existingGift.set(giftData);
         const updatedGift = await existingGift.save();

         return res.status(200).json({ message: 'Gift updated successfully.', gift: updatedGift });
      } catch (error) {
         this.handleError(error, res, 'Error updating gift');
      }
   }

   async deleteGift(req, res) {
      try {
         const { id } = req.params;

         const existingGift = await Gift.findById(id);
         if (!existingGift) {
            return res.status(404).json({ error: 'Gift not found.' });
         }

         await this.removeGiftFromLocations(id);
         await this.deleteImage(existingGift.image);
         await Gift.findByIdAndDelete(id);

         return res.status(200).json({ message: 'Gift deleted successfully.' });
      } catch (error) {
         this.handleError(error, res, 'Error deleting gift');
      }
   }

   async removeGiftFromLocations(giftId) {
      const locations = await Location.find({ gifts: giftId });

      // Loop through each location and remove the gift ID
      for (const location of locations) {
         location.gifts = location.gifts.filter(gift => !gift.equals(giftId));
         await location.save();
      }
   }

   async changeGiftStatus(req, res) {
      try {
         const { id } = req.params;
         const { status } = req.body;

         const gift = await Gift.findById(id);
         if (!gift) {
            return res.status(404).json({ error: 'Gift not found.' });
         }

         gift.status = status;
         const updatedGift = await gift.save();

         return res.status(200).json({
            message: 'Gift status updated successfully.',
            gift: updatedGift,
         });
      } catch (error) {
         this.handleError(error, res, 'Error changing gift status');
      }
   }

   async deleteImage(imageUrl) {
      const fileName = imageUrl.slice(imageUrl.lastIndexOf('/') + 1);
      const oldImagePath = path.join(__dirname, '../public/uploads/gifts', fileName);
      try {
         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }
      } catch (error) {
         console.error('Error deleting image:', error);
      }
   }


   handleError(error, res, context) {
      console.error(context, error);
      return res.status(500).json({ error: error.message });
   }
}

module.exports = GiftController;
