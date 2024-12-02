const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare');
const occasionController = require('../controllersClass/occasionController');
const path = require('path');

const occasionRouter = express.Router();
const { authorization, superAdminAuth } = require('../middleware/authorization');
const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/occasions'),
   fileSize: 1024 * 1024 * 5,
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg',,'image/webp'],
};

occasionRouter.post('/', authorization, createFileUploadMiddleware(uploadOptions), occasionController.addOccasion);
occasionRouter.get('/', authorization, occasionController.getOccasions);
occasionRouter.put('/:id', superAdminAuth, createFileUploadMiddleware(uploadOptions), occasionController.updateOccasion);
occasionRouter.delete('/:id', superAdminAuth, occasionController.deleteOccasion);
occasionRouter.put('/status/:id', superAdminAuth, occasionController.changeOccasionStatus);

occasionRouter.get('/getAllOccasions', occasionController.getAllOccasions);

module.exports = occasionRouter;
