import express from 'express';
import { listTenders } from '../../controllers/User/TenderController.js';
const router = express.Router();
router.get('/', listTenders);
export default router;