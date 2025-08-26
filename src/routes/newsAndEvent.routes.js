import express from 'express';
import { create, findAll, findOne, update, destroy, toggleStatus} from '../controllers/newsAndEvent.controller.js';
import upload from '../middlewares/upload.js';
const router = express.Router();
router.post('/', upload, create);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id', upload, update);
router.delete('/:id', destroy);
router.patch('/status/:id', toggleStatus);

export default router;