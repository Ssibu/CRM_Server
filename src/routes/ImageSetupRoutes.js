import express from 'express';
import {
  getAllHomePageBanners,
  uploadHomePageBanner,
  updateHomePageBanner,
  toggleHomepageBannerStatus,  // <-- import new controller
} from '../controllers/ImageSetupController.js';

import authMiddleware from '../middlewares/AuthMiddleware.js';
import  upload  from '../middlewares/UploadMiddleware.js';

const imageSetupRoutes = express.Router();

// POST - upload new homepage banner
imageSetupRoutes.post(
  '/upload/homepage/banner',
  authMiddleware,
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
imageSetupRoutes.get(
  '/allhomepagebanners',
  authMiddleware,
  getAllHomePageBanners
);

// PUT - update existing homepage banner by ID
imageSetupRoutes.put(
  '/upload/homepage/banner/:id',
  authMiddleware,
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

// PUT - toggle homepage banner status by ID
imageSetupRoutes.put(
  '/homepage/banner/toggle-status/:id',
  authMiddleware,
  toggleHomepageBannerStatus
);

export default imageSetupRoutes;
