const Gift = require('../schema/giftSchema')
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const addGift = async (req, res) => {
   try {
      const giftData = req.body;

      if (!giftData.name || !req.file) {
         return res.status(400).json({ error: 'Name, description, and image are required.' });
      }

      const imageFileName = `${process.env.BACKENDURI}/uploads/gifts/${req.file.filename}`;
      giftData.image = imageFileName;

      const gift = new Gift(giftData);
      const newGift = await gift.save();

      return res.status(201).json({ message: "Gift added successfully", gift: newGift });
   } catch (error) {
      console.error('Error adding gift:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const getGifts = async (req, res) => {
   try {
      const gifts = await Gift.find().sort({ position: 1 });
      return res.status(200).json({ message: 'Gifts fetched successfully', gifts });
   } catch (error) {
      console.error('Error getting gifts:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const updateGift = async (req, res) => {
   try {
      const { id } = req.params;
      const giftData = req.body;

      const existingGift = await Gift.findById(id);
      if (!existingGift) {
         return res.status(404).json({ error: 'Gift not found.' });
      }

      if (req.file) {
         const fileName = existingGift.image.slice(existingGift.image.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/gifts', fileName);

         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }

         giftData.image = `${process.env.BACKENDURI}/uploads/gifts/${req.file.filename}`;
      } else {
         giftData.image = existingGift.image;
      }

      existingGift.set(giftData);
      const updatedGift = await existingGift.save();

      return res.status(200).json({ message: 'Gift updated successfully.', gift: updatedGift });
   } catch (error) {
      console.error('Error updating gift:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const deleteGift = async (req, res) => {
   try {
      const { id } = req.params;

      const existingGift = await Gift.findById(id);
      if (!existingGift) {
         return res.status(404).json({ error: 'Gift not found.' });
      }

      const fileName = existingGift.image.slice(existingGift.image.lastIndexOf('/') + 1);
      const oldImagePath = path.join(__dirname, '../public/uploads/gifts', fileName);
      if (fs.existsSync(oldImagePath)) {
         fs.unlinkSync(oldImagePath);
      }

      await Gift.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Gift deleted successfully.' });
   } catch (error) {
      console.error('Error deleting gift:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const changeGiftStatus = async (req, res) => {
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
      console.error('Error changing gift status:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

module.exports = { addGift, getGifts, updateGift, deleteGift, changeGiftStatus };
