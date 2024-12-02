const express = require('express');
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare');
const cakeController = require('../controllersClass/cakeController');
const path = require('path');

const cakeRouter = express.Router();
const { authorization, superAdminAuth } = require('../middleware/authorization');
const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/cakes'),
   fileSize: 1024 * 1024 * 5,
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg',,'image/webp'],
};

cakeRouter.post('/', authorization, createFileUploadMiddleware(uploadOptions), cakeController.addCake);
cakeRouter.get('/', authorization, cakeController.getCakes);
cakeRouter.put('/:id', superAdminAuth, createFileUploadMiddleware(uploadOptions), cakeController.updateCake);
cakeRouter.delete('/:id', superAdminAuth, cakeController.deleteCake);
cakeRouter.put('/status/:id', superAdminAuth, cakeController.changeCakeStatus);

cakeRouter.get('/getAllCakes', cakeController.getAllCakes);

module.exports = cakeRouter;
