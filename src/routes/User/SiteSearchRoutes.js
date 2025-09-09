import express from 'express';
import { siteSearch } from '../../controllers/User/SiteSearchController.js';

const router = express.Router();

router.get('/', siteSearch);

export default router;