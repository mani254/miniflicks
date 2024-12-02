const Banner = require('../schema/BannerSchema.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class BannerController {
   constructor() {
      this.addBanner = this.addBanner.bind(this);
      this.getBanners = this.getBanners.bind(this);
      this.updateBanner = this.updateBanner.bind(this);
      this.deleteBanner = this.deleteBanner.bind(this);
      this.changeBannerStatus = this.changeBannerStatus.bind(this);
   }

   async addBanner(req, res) {
      try {
         console.log('hello from banner starting')
         const bannerData = this.validateBannerData(req);
         const imageFileName = this.handleImageUpload(req);
         bannerData.image = imageFileName;

         const banner = new Banner(bannerData);
         const newBanner = await banner.save();
         return res.status(201).json({ message: "Banner added successfully", banner: newBanner });
      } catch (error) {
         this.handleError(res, error, 'Error adding banner');
      }
   }

   async getBanners(req, res) {
      try {
         const banners = await Banner.find().sort({ position: 1 });
         return res.status(200).json({ message: 'Banners fetched successfully', banners });
      } catch (error) {
         this.handleError(res, error, 'Error getting banners');
      }
   }

   async updateBanner(req, res) {
      try {
         const { id } = req.params;
         const bannerData = this.validateBannerData(req);

         const existingBanner = await Banner.findById(id);
         if (!existingBanner) return res.status(404).json({ error: 'Banner not found.' });

         if (req.file) {
            this.deleteImage(existingBanner.image);
            bannerData.image = this.handleImageUpload(req);
         } else {
            bannerData.image = existingBanner.image;
         }

         existingBanner.set(bannerData);
         const updatedBanner = await existingBanner.save();
         return res.status(200).json({ message: 'Banner updated successfully.', banner: updatedBanner });
      } catch (error) {
         this.handleError(res, error, 'Error updating banner');
      }
   }

   async deleteBanner(req, res) {
      try {
         const { id } = req.params;
         const existingBanner = await Banner.findById(id);
         if (!existingBanner) return res.status(404).json({ error: 'Banner not found.' });

         this.deleteImage(existingBanner.image);
         await Banner.findByIdAndDelete(id);
         return res.status(200).json({ message: 'Banner deleted successfully.' });
      } catch (error) {
         this.handleError(res, error, 'Error deleting banner');
      }
   }

   async changeBannerStatus(req, res) {
      try {
         const { id } = req.params;
         const { status } = req.body;

         const banner = await Banner.findById(id);
         if (!banner) return res.status(404).json({ error: 'Banner not found.' });

         banner.status = status;
         const updatedBanner = await banner.save();
         return res.status(200).json({ message: 'Banner status updated successfully.', banner: updatedBanner });
      } catch (error) {
         this.handleError(res, error, 'Error changing banner status');
      }
   }

   validateBannerData(req) {
      const { title, description } = req.body;
      if (!title || !description || !req.file) {
         throw new Error('Title, description, and image are required.');
      }
      return req.body;
   }

   handleImageUpload(req) {
      return `${process.env.BACKENDURI}/uploads/banners/${req.file.filename}`;
   }

   deleteImage(imageUrl) {
      const fileName = imageUrl.slice(imageUrl.lastIndexOf('/') + 1);
      const oldImagePath = path.join(__dirname, '../public/uploads/banners', fileName);
      if (fs.existsSync(oldImagePath)) {
         fs.unlinkSync(oldImagePath);
      }
   }

   handleError(res, error, context) {
      console.error(context, error);
      return res.status(500).json({ error: error.message });
   }
}

module.exports = new BannerController();
