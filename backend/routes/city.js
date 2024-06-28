const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController.js');


const multer = require('multer');

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'public/images/cities')
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


router.post('/', upload.single('image'), cityController.createCity);

router.get('/', cityController.getCities);
router.get('/:id', cityController.getCityById);
router.get('/active', cityController.getActiveCities)
router.get('/cityWithPopulatedLocations', cityController.getCityWithPopulatedLocations);

router.put('/:id', upload.single('image'), cityController.updateCity);

// router.put('/:id', cityController.updateCityStatus)

router.delete('/:id', cityController.deleteCity);


module.exports = router;
