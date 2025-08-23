import express from 'express';
import { create, findAll, update, destroy, updateOrder } from '../controllers/actAndRule.controller.js';

const router = express.Router();

// Route to create a new Act & Rule
router.post('/', create);

// Route to get all Act & Rules
router.get('/', findAll);

// Route to update the display order
router.put('/order', updateOrder);

// Route to update a specific Act & Rule by ID
router.put('/:id', update);

// Route to delete a specific Act & Rule by ID
router.delete('/:id', destroy);

export default router;