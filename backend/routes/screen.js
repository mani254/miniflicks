const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare');
const screenRouter = express.Router();
const path = require('path');
const ScreenController = require('../controllersClass/screenController')

const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/screens'),
   fileSize: 1024 * 1024 * 5,
   single: false,
   fieldName: 'images',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};

screenRouter.post('/', createFileUploadMiddleware(uploadOptions), ScreenController.addScreen);
screenRouter.post('/', ScreenController.addScreen);
screenRouter.get('/', ScreenController.getScreens);
screenRouter.put('/:id', createFileUploadMiddleware(uploadOptions), ScreenController.updateScreen);
screenRouter.put('/status/:id', ScreenController.changeScreenStatus);
screenRouter.delete('/:id', ScreenController.deleteScreen);

module.exports = screenRouter;
