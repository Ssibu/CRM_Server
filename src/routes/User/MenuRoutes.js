import express from 'express';
import { getNavigationTree } from '../../controllers/User/MenuController.js';

const router = express.Router();

router.get('/', getNavigationTree);

export default router;