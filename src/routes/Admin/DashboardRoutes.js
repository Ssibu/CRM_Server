import express from 'express';
import { getDashboardStats } from '../../controllers/Admin/DashboardController.js';
import {auth} from "../../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth)


router.get('/stats', getDashboardStats);

export default router;