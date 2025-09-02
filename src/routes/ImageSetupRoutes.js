import express from 'express';
import {
  getAllHomePageBanners,
  uploadHomePageBanner,
  updateHomePageBanner,
  toggleHomepageBannerStatus,
  getHomePageBannerById,  // <-- import new controller
} from '../controllers/ImageSetupController.js';

import {auth, hp} from '../middlewares/AuthMiddleware.js';
import  upload  from '../middlewares/UploadMiddleware.js';

const router = express.Router();
router.use(auth)


// POST - upload new homepage banner
router.post(
  '/upload/homepage/banner',
  ...upload({
    field: 'banner',
    mode: 'single',
    prefix: 'banner',
    uploadDir: 'public/uploads/banners',
    resize: true,
    width: 1200,
    height: 400,
    allowedTypes: ['image/'],
    maxSize: 5 * 1024 * 1024,
  }),
  uploadHomePageBanner
);

// GET - get all homepage banners
router.get(
  '/allhomepagebanners',
  hp("HB"),
  getAllHomePageBanners
);

// PUT - update existing homepage banner by ID
router.put(
  '/upload/homepage/banner/:id',
    hp("HB"),
  ...upload({
    field: 'banner',
    mode: 'single',
    prefix: 'banner',
    uploadDir: 'public/uploads/banners',
    resize: true,
    width: 1200,
    height: 400,
    allowedTypes: ['image/'],
    maxSize: 5 * 1024 * 1024,
  }),
  updateHomePageBanner
);
// ✅ GET - get single homepage banner by ID
router.get(
  '/homepage/banner/:id',
    hp("HB"),
  getHomePageBannerById // <-- ✅ Newly added route
);

// PUT - toggle homepage banner status by ID
router.put(
  '/homepage/banner/toggle-status/:id',
    hp("HB"),
  toggleHomepageBannerStatus
);

export default router;
