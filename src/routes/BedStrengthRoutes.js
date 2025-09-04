import express from 'express';
import { create, findAll, findOne, update, destroy, toggleStatus, updateOrder } from '../controllers/BedStrengthController.js';
import upload from '../middlewares/UploadMiddleware.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("NBS"))

// Configure the uploader for the Bed Strength module
const bedStrengthUpload = upload({
    field: "document",
    prefix: "bed-strength-doc",
    uploadDir: "public/uploads/bed_strengths",
    // Allow various document and image types
    allowedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/"]
});

router.post('/', bedStrengthUpload, create);
router.get('/', findAll);
router.get('/:id', findOne);
router.put('/:id', bedStrengthUpload, update);
router.patch('/status/:id', toggleStatus);
router.put('/order', updateOrder);
router.delete('/:id', destroy);

export default router;