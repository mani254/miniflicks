const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare');
const {
   addGift,
   getGifts,
   updateGift,
   deleteGift,
   changeGiftStatus
} = require('../controllers/giftController');
const path = require('path');

const giftRouter = express.Router();

const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/gifts'),
   fileSize: 1024 * 1024 * 5,
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};

// Define routes
giftRouter.post('/', createFileUploadMiddleware(uploadOptions), addGift);
giftRouter.get('/', getGifts);
giftRouter.put('/:id', createFileUploadMiddleware(uploadOptions), updateGift);
giftRouter.delete('/:id', deleteGift);
giftRouter.put('/status/:id', changeGiftStatus);

module.exports = giftRouter;
