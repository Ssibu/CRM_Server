import express from 'express';
import {auth, hp} from '../middlewares/AuthMiddleware.js';
import upload from '../middlewares/UploadMiddleware.js';


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
  
} from '../controllers/GalleryController.js';

const router = express.Router();
router.use(auth)

// Upload middleware for category thumbnail
const uploadThumbnail = upload({
  mode: 'single',
  field: 'thumbnail',
  maxCount: 1,
  uploadDir: 'public/uploads/categories',
  allowedTypes: ['image/'],
  maxSize: 5 * 1024 * 1024,
  prefix: 'thumbnail',
  resize: true,
  width: 400,
  height: 400,
});

// Upload middleware for photo gallery photo
const uploadPhoto = upload({
  mode: 'single',
  field: 'photo',
  maxCount: 1,
  uploadDir: 'public/uploads/photos',
  allowedTypes: ['image/'],
  maxSize: 10 * 1024 * 1024,
  prefix: 'photo',
  resize: true,
  width: 800,
  height: 600,
});

const uploadVideo = upload({
  mode: 'single',
  field: 'video',              // field name in form-data
  maxCount: 1,
  uploadDir: 'public/uploads/videos', // directory for uploaded videos
  allowedTypes: ['video/'],    // allow video mime types only
  maxSize: 50 * 1024 * 1024,  // max size 50MB (adjust as needed)
  prefix: 'video',             // prefix for uploaded filenames
  resize: false,               // no resize for videos
});


//
// 🎨 CATEGORY ROUTES
//


// POST - Register single category (with thumbnail)
router.post(
  '/register-category',
  hp("MG"),
  ...uploadThumbnail,
  registerSingleCategory
);

// POST - Register multiple categories (bulk, no thumbnail)
router.post(
  '/register-multiple-category',
    hp("MG"),
  registerMultipleCategories
);

// GET - Fetch all categories
router.get(
  '/all-categories',
    hp("MG"),
  getAllCategories
);

// PUT - Update existing category by ID
router.put(
  '/update-category/:id',
    hp("MG"),
  ...uploadThumbnail,
  updateSingleCategory
);

// GET - Fetch single category by ID
router.get(
  '/category/:id',
    hp("MG"),
  getCategoryById
);

// PATCH - Toggle category status by ID
router.patch(
  '/toggle-category-status/:id',
    hp("MG"),
  toggleGalaryCategoryStatus
);

//
// 📸 PHOTO GALLERY ROUTES
//

// POST - Register single photo (with file upload)
router.post(
  '/register-photo',
    hp("PG"),
  ...uploadPhoto,
  registerSinglePhoto
);

// GET - Fetch all photos
router.get(
  '/all-photos',
   hp("PG"),
  getAllPhotos
);

// GET - Fetch single photo by ID
router.get(
  '/photo/:id',
   hp("PG"),
  getPhotoById
);

// PUT - Update photo by ID (optionally with new photo file)
router.put(
  '/update-photo/:id',
   hp("PG"),
  ...uploadPhoto,
  updateSinglePhoto
);

// Optional: PATCH - Toggle photo status by ID
router.patch(
  '/toggle-photo-status/:id',
   hp("PG"),
  togglePhotoStatus
);



//--------------------> vudeo galary routes 

// POST - Register single video (with file upload)
router.post(
  '/register-video',
   hp("VG"),
  ...uploadVideo,
  registerSingleVideo
);

// GET - Fetch all videos
router.get(
  '/all-videos',
  hp("VG"),
  getAllVideos
);

// GET - Fetch single video by ID
router.get(
  '/video/:id',
  hp("VG"),
  getVideoById
);

// PUT - Update video by ID (optionally with new video file)
router.put(
  '/update-video/:id',
  hp("VG"),
  ...uploadVideo,
  updateSingleVideo
);

// Optional: PATCH - Toggle video status by ID
router.patch(
  '/toggle-video-status/:id',
  hp("VG"),
  toggleVideoStatus
);

// /image-setup/all-videos
// /image-setup/toggle-video-status/:id



//  /image-setup/video/:id
//  /image-setup//update-video/:id



export default router;
