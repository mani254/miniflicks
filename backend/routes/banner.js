const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare');
const BannerController = require('../controllersClass/bannerController');
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

bannerRouter.post('/', createFileUploadMiddleware(uploadOptions), BannerController.addBanner);
bannerRouter.get('/', BannerController.getBanners);
bannerRouter.put('/:id', createFileUploadMiddleware(uploadOptions), BannerController.updateBanner);
bannerRouter.delete('/:id', BannerController.deleteBanner);
bannerRouter.put('/status/:id', BannerController.changeBannerStatus);

module.exports = bannerRouter;
