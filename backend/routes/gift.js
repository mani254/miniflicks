const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare');
const GiftController = require('../controllersClass/giftController');
const path = require('path');

const giftRouter = express.Router();
const giftController = new GiftController();

const { authorization } = require('../middleware/authorization')

const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/gifts'),
   fileSize: 1024 * 1024 * 5,
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};

// Define routes
giftRouter.post('/', authorization, createFileUploadMiddleware(uploadOptions), giftController.addGift);
giftRouter.get('/', authorization, giftController.getGifts);
giftRouter.put('/:id', authorization, createFileUploadMiddleware(uploadOptions), giftController.updateGift);
giftRouter.delete('/:id', authorization, giftController.deleteGift);
giftRouter.put('/status/:id', authorization, giftController.changeGiftStatus);

module.exports = giftRouter;
