import express from 'express';
// --- 1. Import the new controller functions ---
import { create, findAll, findOne, update, destroy /*, updateOrder*/ } from '../controllers/newsAndEvent.controller.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// ... (POST and GET all routes)
router.post('/', upload, create);
router.get('/', findAll);

// --- 2. ADD THE NEW ROUTES ---
router.get('/:id', findOne);
router.put('/:id', upload, update); // The 'upload' middleware is also needed for updates

router.delete('/:id', destroy);
// ... (updateOrder route)

export default router;