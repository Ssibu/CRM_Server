import express from 'express';
import { getContentBySlug } from '../../controllers/User/PageContentController.js';

const router = express.Router();

router.get('/:slug', getContentBySlug);

export default router;