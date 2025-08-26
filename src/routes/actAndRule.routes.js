import express from 'express';
import { create, findAll,findOne, update, destroy, updateOrder, toggleStatus } from '../controllers/actAndRule.controller.js';

const router = express.Router();
router.post('/', create);
router.get('/', findAll);
router.put('/order', updateOrder);
router.get('/:id', findOne);
router.put('/:id', update);
router.delete('/:id', destroy);
router.patch('/status/:id', toggleStatus);
export default router;