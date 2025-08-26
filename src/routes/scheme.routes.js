import express from 'express';
import { create, findAll, findOne, update, destroy, toggleStatus, updateOrder } from '../controllers/scheme.controller.js';
import {upload} from '../middlewares/upload.js';

const router = express.Router();

// Configure the uploader for the Scheme module
const schemeUpload = upload({
    field: "document",
    prefix: "scheme-doc",
    uploadDir: "public/uploads/schemes",
    allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
});

router.post('/', schemeUpload, create);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id', schemeUpload, update);
router.patch('/status/:id', toggleStatus);
router.put('/order', updateOrder);
router.delete('/:id', destroy);

export default router;