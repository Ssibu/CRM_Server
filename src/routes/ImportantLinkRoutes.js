import express from 'express';
import {
  getAllLinks,
  getLink,
  createLink,
  updateLink,
  deleteLink,
  updateStatus
} from '../controllers/ImportantLinkController.js';
import upload from '../middlewares/UploadMiddleware.js'; 
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("IL"))

// Configure upload middleware for important links
const uploadMiddleware = upload({
  field: 'image',
  uploadDir: 'public/uploads/important-links',
  prefix: 'important-link'
});

// Routes
router.get('/', getAllLinks);
router.get('/:id', getLink);
router.post('/', uploadMiddleware, createLink);
router.put('/:id', uploadMiddleware, updateLink);
router.delete('/:id', deleteLink);
router.patch('/:id/status', updateStatus);

export default router;