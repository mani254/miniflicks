const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare');
const screenRouter = express.Router();
const { addScreen, getScreens, updateScreen, deleteScreen, changeScreenStatus } = require('../controllers/screenController');
const path = require('path');

const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/screens'),
   fileSize: 1024 * 1024 * 5,
   single: false,
   fieldName: 'images',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};

screenRouter.post('/', createFileUploadMiddleware(uploadOptions), addScreen);
screenRouter.post('/', addScreen);
screenRouter.get('/', getScreens);
screenRouter.put('/:id', createFileUploadMiddleware(uploadOptions), updateScreen);
screenRouter.put('/status/:id', changeScreenStatus);
screenRouter.delete('/:id', deleteScreen);

module.exports = screenRouter;
