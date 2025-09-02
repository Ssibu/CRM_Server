import express from 'express';
import { create, findAll, findOne, update, destroy, updateOrder, toggleStatus } from '../controllers/FooterLinkController.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("FL"))
router.post('/', create);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/order', updateOrder);
router.put('/:id', update);
router.delete('/:id', destroy);
router.patch('/status/:id', toggleStatus)

export default router;