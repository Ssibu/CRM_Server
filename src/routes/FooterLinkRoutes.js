import express from 'express';
import { create, findAll, findOne, update, destroy, updateOrder, toggleStatus } from '../controllers/FooterLinkController.js';
const router = express.Router();
router.post('/', create);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/order', updateOrder);
router.put('/:id', update);
router.delete('/:id', destroy);
router.patch('/status/:id', toggleStatus)

export default router;