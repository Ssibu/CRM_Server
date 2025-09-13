import express from 'express';
import { getAllActiveEvents } from '../../controllers/User/userNewsAndEventController.js';

const router = express.Router();

router.get('/', getAllActiveEvents); // Public route

export default router;