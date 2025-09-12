import express from 'express';
import { getDirectorAndAboutData } from '../../controllers/User/HomeDirectorDeskController.js'; 

const router = express.Router();

router.get('/', getDirectorAndAboutData);

export default router;