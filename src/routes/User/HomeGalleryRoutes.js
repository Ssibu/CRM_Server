import express from 'express';
import { getGalleryAndEventsData } from '../../controllers/User/HomeGalleryController.js'; 

const router = express.Router();

router.get('/', getGalleryAndEventsData);

export default router;