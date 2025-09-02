import express from 'express';
import { getDashboardStats } from '../controllers/DashboardController.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("DB"))


router.get('/stats', getDashboardStats);

export default router;