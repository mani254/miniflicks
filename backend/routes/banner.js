const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare'); // Adjust the path as necessary
const {
   addBanner,
   getBanners,
   updateBanner,
   deleteBanner,
   changeBannerStatus
} = require('../controllers/bannerController');
const path = require('path');

const bannerRouter = express.Router();

const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/banners'),
   fileSize: 1024 * 1024 * 5,
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};

// Define routes
bannerRouter.post('/', createFileUploadMiddleware(uploadOptions), addBanner);
bannerRouter.get('/', getBanners);
bannerRouter.put('/:id', createFileUploadMiddleware(uploadOptions), updateBanner);
bannerRouter.delete('/:id', deleteBanner);
bannerRouter.put('/status/:id', changeBannerStatus);

module.exports = bannerRouter;
