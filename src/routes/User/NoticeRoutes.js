import express from 'express';
import { getPublicNotices } from '../../controllers/User/NoticeController.js';

const router = express.Router();

router.get('/', getPublicNotices);


export default router;