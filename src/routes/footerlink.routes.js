import express from 'express';
import { create, findAll, update, destroy, updateOrder } from '../controllers/footerlink.controller.js';

const router = express.Router();

// Route to create a new footer link
router.post('/', create);

// Route to get all footer links
router.get('/', findAll);

// Route to update the order of links
router.put('/order', updateOrder);

// Route to update a specific link by ID
router.put('/:id', update);

// Route to delete a specific link by ID
router.delete('/:id', destroy);

export default router;