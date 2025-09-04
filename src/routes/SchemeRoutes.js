import express from 'express';
import { create, findAll, findOne, update, destroy, toggleStatus, updateOrder } from '../controllers/SchemeController.js';
import upload from '../middlewares/UploadMiddleware.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("NS"))

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