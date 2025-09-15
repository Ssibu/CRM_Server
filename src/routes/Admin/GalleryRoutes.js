import express from 'express';
import {auth, hp} from '../../middlewares/AuthMiddleware.js';
import upload from '../../middlewares/UploadMiddleware.js';


import {
  getAllCategories,
  getCategoryById,
  registerMultipleCategories,
  registerSingleCategory,
  toggleGalaryCategoryStatus,
  updateSingleCategory,

  registerSinglePhoto,
  getAllPhotos,
  getPhotoById,
  updateSinglePhoto,
  togglePhotoStatus,
  registerSingleVideo,
  getAllVideos,
  getVideoById,
  updateSingleVideo,
  toggleVideoStatus,
  
} from '../../controllers/Admin/GalleryController.js';

const router = express.Router();
router.use(auth)

const uploadThumbnail = upload({
  mode: 'single',
  field: 'thumbnail',
  maxCount: 1,
  uploadDir: 'public/uploads/categories',
  allowedTypes: ['image/'],
  maxSize: 3 * 1024 * 1024,
  prefix: 'thumbnail',
  resize: true,
  width: 800,
  height: 600,
});

const uploadPhoto = upload({
  mode: 'single',
  field: 'photo',
  maxCount: 1,
  uploadDir: 'public/uploads/photos',
  allowedTypes: ['image/'],
  maxSize: 3 * 1024 * 1024,
  prefix: 'photo',
  resize: true,
  width: 800,
  height: 600,
});

const uploadVideo = upload({
  mode: 'single',
  field: 'video',
  maxCount: 1,
  uploadDir: 'public/uploads/videos',
  allowedTypes: ['video/'],
  maxSize: 1 * 1024 * 1024,
  prefix: 'video',
  resize: false,
});




router.post(
  '/register-category',
  hp("MG"),
  ...uploadThumbnail,
  registerSingleCategory
);

router.post(
  '/register-multiple-category',
    hp("MG"),
  registerMultipleCategories
);

router.get(
  '/all-categories',
    hp("MG"),
  getAllCategories
);

router.put(
  '/update-category/:id',
    hp("MG"),
  ...uploadThumbnail,
  updateSingleCategory
);

router.get(
  '/category/:id',
    hp("MG"),
  getCategoryById
);

router.patch(
  '/toggle-category-status/:id',
    hp("MG"),
  toggleGalaryCategoryStatus
);


router.post(
  '/register-photo',
    hp("PG"),
  ...uploadPhoto,
  registerSinglePhoto
);

router.get(
  '/all-photos',
   hp("PG"),
  getAllPhotos
);

router.get(
  '/photo/:id',
   hp("PG"),
  getPhotoById
);

router.put(
  '/update-photo/:id',
   hp("PG"),
  ...uploadPhoto,
  updateSinglePhoto
);

router.patch(
  '/toggle-photo-status/:id',
   hp("PG"),
  togglePhotoStatus
);




router.post(
  '/register-video',
   hp("VG"),
  ...uploadVideo,
  registerSingleVideo
);

router.get(
  '/all-videos',
  hp("VG"),
  getAllVideos
);

router.get(
  '/video/:id',
  hp("VG"),
  getVideoById
);

router.put(
  '/update-video/:id',
  hp("VG"),
  ...uploadVideo,
  updateSingleVideo
);

router.patch(
  '/toggle-video-status/:id',
  hp("VG"),
  toggleVideoStatus
);







export default router;
