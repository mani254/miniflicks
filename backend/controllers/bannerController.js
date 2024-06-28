const Banner = require('../models/bannerSchema');

const bannerController = {
   createBanner: async (req, res) => {
      try {
         const { position, status, heading, content, redirection } = req.body;

         const image = `images/banners/${req.file.filename}`;

         const newBanner = new Banner({
            position,
            status,
            image,
            heading,
            content,
            redirection
         });
         await newBanner.save();
         res.status(201).json({ message: 'Banner added successfully', banner: newBanner });
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   getBanners: async (req, res) => {
      try {
         const banners = await Banner.find();
         res.json(banners);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   updateBanner: async (req, res) => {
      try {
         let { position, status, heading, content, redirection, image } = req.body;

         if (req?.file?.filename) {
            image = `images/banners/${req.file.filename}`;
         }

         const bannerData = await Banner.findByIdAndUpdate(req.params.id, { position, status, image, heading, content, redirection }, { new: true });
         if (!bannerData) {
            return res.status(404).json({ error: 'Banner not found' });
         }
         res.json({ banner: bannerData });
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   deleteBanner: async (req, res) => {
      try {
         const banner = await Banner.findByIdAndDelete(req.params.id);
         if (!banner) {
            return res.status(404).json({ error: 'Banner not found' });
         }
         res.json({ message: 'Banner deleted successfully' });
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   },

   updateBannerStatus: async (req, res) => {
      try {
         const { status } = req.body;
         const banner = await Banner.findByIdAndUpdate(req.params.id, { status }, { new: true });
         if (!banner) {
            return res.status(404).json({ error: 'Banner not found' });
         }
         res.json(banner);
      } catch (error) {
         res.status(500).json({ error: error.message });
      }
   }
};

module.exports = bannerController;
