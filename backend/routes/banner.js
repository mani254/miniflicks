const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');


const multer = require('multer');

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, 'public/images/banners')
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


router.post('/', upload.single('image'), bannerController.createBanner);

router.get('/', bannerController.getBanners);

router.put('/:id', upload.single('image'), bannerController.updateBanner);
router.put('/:id/status', bannerController.updateBannerStatus);

router.delete('/:id', bannerController.deleteBanner);

module.exports = router;