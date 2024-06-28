const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController')

const multer = require('multer');

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'public/images/locations')
   },
   filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname)
   }
})

const fileFilter = (req, file, cb) => {
   if (file.mimetype.startsWith('image/')) {
      cb(null, true);
   } else {
      cb(new Error('Only images are allowed'), false);
   }
};

const upload = multer({
   storage: storage,
   limits: {
      fileSize: 1024 * 1024 * 2.5,
   },
   fileFilter: fileFilter
});

router.post('/', upload.single('image'), locationController.createLocation);

router.get('/', locationController.getLocations);
router.get('/active', locationController.getActiveLocations);
router.get('/:id', locationController.getLocationById);
router.get('/populatedScreens', locationController.getLocationsWithPopulatedScreens);

router.put('/:id', upload.single('image'), locationController.updateLocation);
router.put('/:id/status', locationController.updateLocationStatus);

router.delete('/:id', locationController.deleteLocation);

module.exports = router;
