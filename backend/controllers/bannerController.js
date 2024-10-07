const Banner = require('../schema/BannerSchema.js')
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const addBanner = async (req, res) => {
   try {
      const bannerData = req.body;

      if (!bannerData.title || !bannerData.description || !req.file) {
         return res.status(400).json({ error: 'Title, description, and image are required.' });
      }

      const imageFileName = `${process.env.BACKENDURI}/uploads/banners/${req.file.filename}`;
      bannerData.image = imageFileName;

      const banner = new Banner(bannerData);
      const newBanner = await banner.save();

      return res.status(201).json({ message: "Banner added successfully", banner: newBanner });
   } catch (error) {
      console.error('Error adding banner:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const getBanners = async (req, res) => {
   try {
      const banners = await Banner.find().sort({ position: 1 }); // Sort by position in ascending order
      return res.status(200).json({ message: 'Banners fetched successfully', banners });
   } catch (error) {
      console.error('Error getting banners:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const updateBanner = async (req, res) => {
   try {
      const { id } = req.params;
      const bannerData = req.body;

      const existingBanner = await Banner.findById(id);
      if (!existingBanner) {
         return res.status(404).json({ error: 'Banner not found.' });
      }

      if (req.file) {
         const fileName = existingBanner.image.slice(existingBanner.image.lastIndexOf('/') + 1);
         const oldImagePath = path.join(__dirname, '../public/uploads/banners', fileName);

         if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
         }

         bannerData.image = `${process.env.BACKENDURI}/uploads/banners/${req.file.filename}`;
      } else {
         bannerData.image = existingBanner.image;
      }

      existingBanner.set(bannerData);
      const updatedBanner = await existingBanner.save();

      return res.status(200).json({ message: 'Banner updated successfully.', banner: updatedBanner });
   } catch (error) {
      console.error('Error updating banner:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const deleteBanner = async (req, res) => {
   try {
      const { id } = req.params;

      const existingBanner = await Banner.findById(id);
      if (!existingBanner) {
         return res.status(404).json({ error: 'Banner not found.' });
      }

      const fileName = existingBanner.image.slice(existingBanner.image.lastIndexOf('/') + 1);
      const oldImagePath = path.join(__dirname, '../public/uploads/banners', fileName);
      if (fs.existsSync(oldImagePath)) {
         fs.unlinkSync(oldImagePath);
      }

      await Banner.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Banner deleted successfully.' });
   } catch (error) {
      console.error('Error deleting banner:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

const changeBannerStatus = async (req, res) => {
   try {
      const { id } = req.params;
      const { status } = req.body;

      const banner = await Banner.findById(id);
      if (!banner) {
         return res.status(404).json({ error: 'Banner not found.' });
      }

      banner.status = status;
      const updatedBanner = await banner.save();

      return res.status(200).json({
         message: 'Banner status updated successfully.',
         banner: updatedBanner,
      });
   } catch (error) {
      console.error('Error changing banner status:', error);
      return res.status(500).json({ error: 'Internal server error.' });
   }
};

module.exports = { addBanner, getBanners, updateBanner, deleteBanner, changeBannerStatus };
