import express from 'express';
import { findAll } from '../../controllers/User/NewsAndEventController.js';
const router = express.Router();
router.get('/', findAll);

export default router;