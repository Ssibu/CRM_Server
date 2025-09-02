import express from 'express';
import {
    addAdvertisement,
    listAdvertisements,
    getAdvertisementById,
    updateAdvertisement,
    toggleAdvertisementStatus,
} from '../controllers/AdvertisementController.js';
import upload from "../middlewares/UploadMiddleware.js"
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("NA"))

const img = upload({
  // Use 'fields' mode for multiple, distinctly named file inputs
  mode: 'fields', 
  
  field: [
    { name: 'en_adphoto', maxCount: 1 },
    { name: 'od_adphoto', maxCount: 1 },
  ],
  
  uploadDir: 'public/uploads/advertisements', // Dedicated directory
  allowedTypes: ['image/'],                     // Allow all image types (jpeg, png, etc.)
  maxSize: 2 * 1024 * 1024,                   // 2MB size limit for images
  prefix: 'ad',                               // 'ad' prefix for filenames
  
  // Enable resizing to standardize ad images
  resize: true,
  width: 800,  // Example width
  height: 600, // Example height
});

// Route to add a new advertisement and list all advertisements
router.route('/')
    .post(img, addAdvertisement)
    .get(listAdvertisements);

// Routes for a specific advertisement by ID
router.route('/:id')
    .get(getAdvertisementById)
    .patch(img, updateAdvertisement);

// Route to toggle the active status
router.patch('/:id/status', toggleAdvertisementStatus);

export default router;