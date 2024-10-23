const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare');
const addonController = require('../controllersClass/addonController');
const path = require('path');

const addonRouter = express.Router();
const { authorization, superAdminAuth } = require('../middleware/authorization')
const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/addons'),
   fileSize: 1024 * 1024 * 5,
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};

addonRouter.post('/', authorization, createFileUploadMiddleware(uploadOptions), addonController.addAddon);
addonRouter.get('/', authorization, addonController.getAddons);
addonRouter.put('/:id', superAdminAuth, createFileUploadMiddleware(uploadOptions), addonController.updateAddon);
addonRouter.delete('/:id', superAdminAuth, addonController.deleteAddon);
addonRouter.put('/status/:id', superAdminAuth, addonController.changeAddonStatus);

addonRouter.get('/getAllAddons', addonController.getAllAddons)


module.exports = addonRouter;
