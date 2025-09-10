import express from 'express';
import { getFooterData } from '../../controllers/User/HomeFooterController.js';

const router = express.Router();

// Define the public route for fetching all footer data
router.get('/', getFooterData);

// ... other routes

export default router;