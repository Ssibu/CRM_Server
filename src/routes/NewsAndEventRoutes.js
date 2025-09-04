import express from 'express';
import { create, findAll, findOne, update, destroy, toggleStatus} from '../controllers/NewsAndEvenetController.js';
import upload from '../middlewares/UploadMiddleware.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"


const router = express.Router();
router.use(auth).use(hp("NE"))

router.post('/', upload({
    field: "document",
    prefix: "event-doc",
    uploadDir: "public/uploads/events",
    allowedTypes: [ "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
}), create);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id', upload({
    field: "document",
    prefix: "event-doc",
    uploadDir: "public/uploads/events",
    allowedTypes: [ "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
}), update);
router.delete('/:id', destroy);
router.patch('/status/:id', toggleStatus);

export default router;