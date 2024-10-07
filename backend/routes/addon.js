const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare'); // Adjust path if necessary
const {
   addAddon,
   getAddons,
   updateAddon,
   deleteAddon,
   changeAddonStatus,
} = require('../controllers/addonController'); // Adjust path if necessary
const path = require('path');

const addonRouter = express.Router();

const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/addons'), // Change the path for addons
   fileSize: 1024 * 1024 * 5, // Max file size (5 MB)
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2, // Max size for single image (2 MB)
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};

// Define routes
addonRouter.post('/', createFileUploadMiddleware(uploadOptions), addAddon);
addonRouter.get('/', getAddons);
addonRouter.put('/:id', createFileUploadMiddleware(uploadOptions), updateAddon);
addonRouter.delete('/:id', deleteAddon);
addonRouter.put('/status/:id', changeAddonStatus);

module.exports = addonRouter;
