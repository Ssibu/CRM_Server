import express from 'express';
import { findAllUser } from '../../controllers/User/BedStrengthController.js'; 

const router = express.Router();

// This makes the controller function available at the root of this router
router.get('/', findAllUser);

export default router;