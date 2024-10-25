const express = require('express')
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare')
const locationRouter = express.Router()
// const { addLocation, getLocations, updateLocation, deleteLocation, changeLocationStatus } = require('../controllers/locationController')
const locationController = require('../controllersClass/locationController')
const path = require('path');

const { authorization, superAdminAuth, userAuth } = require('../middleware/authorization')

const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/locations'),
   fileSize: 1024 * 1024 * 5,
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};


locationRouter.post('/', superAdminAuth, createFileUploadMiddleware(uploadOptions), locationController.addLocation)
locationRouter.get('/', userAuth, locationController.getLocations)
locationRouter.get('/:id', authorization, locationController.getLocation)
locationRouter.put('/:id', authorization, createFileUploadMiddleware(uploadOptions), locationController.updateLocation)
locationRouter.put('/status/:id', authorization, locationController.changeLocationStatus);
locationRouter.delete('/:id', superAdminAuth, locationController.deleteLocation);


module.exports = locationRouter