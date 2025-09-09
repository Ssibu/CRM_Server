import express from 'express';
// We need a user-facing controller. Let's create one.
import { findAllUser } from '../../controllers/User/PolicyController.js'; 

const router = express.Router();

// This route is public and only allows finding all policies.
router.get('/', findAllUser);

export default router;