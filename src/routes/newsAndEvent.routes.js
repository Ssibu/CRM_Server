import express from 'express';
import { create, findAll, findOne, update, destroy, toggleStatus} from '../controllers/newsAndEvent.controller.js';
import {upload} from '../middlewares/upload.js';
const router = express.Router();
router.post('/', upload({
    field: "document",
    prefix: "event-doc",
    uploadDir: "public/uploads/events", // Optional: Save to a specific folder
    allowedTypes: ["image/", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
}), create);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id', upload({
    field: "document",
    prefix: "event-doc",
    uploadDir: "public/uploads/events",
    allowedTypes: ["image/", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
}), update);
router.delete('/:id', destroy);
router.patch('/status/:id', toggleStatus);

export default router;