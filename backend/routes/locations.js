const express = require('express')
const createFileUploadMiddleware = require('../middleware/fileUploadMiddleWare')
const locationRouter = express.Router()
// const { addLocation, getLocations, updateLocation, deleteLocation, changeLocationStatus } = require('../controllers/locationController')
const locationController = require('../controllersClass/locationController')
const path = require('path');

const uploadOptions = {
   storagePath: path.join(__dirname, '../public/uploads/locations'),
   fileSize: 1024 * 1024 * 5,
   single: true,
   fieldName: 'image',
   maxSize: 1024 * 1024 * 2,
   allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'],
};

// locationRouter.post('/', createFileUploadMiddleware(uploadOptions), addLocation)
// locationRouter.get('/', getLocations)
// locationRouter.put('/:id', createFileUploadMiddleware(uploadOptions), updateLocation)
// locationRouter.put('/status/:id', changeLocationStatus);
// locationRouter.delete('/:id', deleteLocation);
locationRouter.post('/', createFileUploadMiddleware(uploadOptions), locationController.addLocation)
locationRouter.get('/', locationController.getLocations)
locationRouter.put('/:id', createFileUploadMiddleware(uploadOptions), locationController.updateLocation)
locationRouter.put('/status/:id', locationController.changeLocationStatus);
locationRouter.delete('/:id', locationController.deleteLocation);


module.exports = locationRouter