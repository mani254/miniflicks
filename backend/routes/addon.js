const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare');
const addonController = require('../controllers/addonController');
const path = require('path');

const addonRouter = express.Router();

const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/addons'),
   fileSize: 1024 * 1024 * 5,
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};

addonRouter.post('/', createFileUploadMiddleware(uploadOptions), addonController.addAddon);
addonRouter.get('/', addonController.getAddons);
addonRouter.put('/:id', createFileUploadMiddleware(uploadOptions), addonController.updateAddon);
addonRouter.delete('/:id', addonController.deleteAddon);
addonRouter.put('/status/:id', addonController.changeAddonStatus);

module.exports = addonRouter;
