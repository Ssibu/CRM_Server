import express from 'express';
// --- 1. IMPORT `findOne` FROM THE CONTROLLER ---
import { create, findAll, findOne, update, destroy, updateOrder } from '../controllers/footerlink.controller.js';

const router = express.Router();

// Route to create a new footer link
router.post('/', create);

// Route to get all footer links
router.get('/', findAll);

// --- 2. ADD THE MISSING ROUTE FOR GETTING ONE ITEM ---
// This handles GET requests to /api/footerlinks/:id
router.get('/:id', findOne);

// Route to update the order of links
router.put('/order', updateOrder);

// Route to update a specific link by ID
router.put('/:id', update);

// Route to delete a specific link by ID
router.delete('/:id', destroy);

export default router;