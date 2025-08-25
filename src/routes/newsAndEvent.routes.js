import express from 'express';
import { create, findAll, destroy } from '../controllers/newsAndEvent.controller.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// POST /api/news-and-events
// The 'upload' middleware processes the file upload before the 'create' controller is called.
router.post('/', upload, create);

// GET /api/news-and-events
router.get('/', findAll);

// DELETE /api/news-and-events/:id
router.delete('/:id', destroy);

// Define your PUT routes for update and reordering here later

export default router;