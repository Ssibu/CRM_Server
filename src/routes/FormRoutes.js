import express from 'express';
import { create, findAll, findOne, update, destroy, toggleStatus, updateOrder } from '../controllers/FormController.js';
import upload from '../middlewares/UploadMiddleware.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("NF"))

// Configure the uploader for the "Forms" module
const formUpload = upload({
    field: "document",
    prefix: "form-doc",
    uploadDir: "public/uploads/forms",
    allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
});

router.post('/', formUpload, create);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id', formUpload, update);
router.patch('/status/:id', toggleStatus);
router.put('/order', updateOrder);
router.delete('/:id', destroy); 

export default router;