import express from 'express';
import { create, findAll, findOne, update, destroy, toggleStatus, updateOrder } from '../controllers/PolicyController.js';
// --- CORRECTED: Import the default export and name it 'upload' ---
import upload from '../middlewares/UploadMiddleware.js'; 
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("NP"))

// --- CREATE Route ---
// A POST request to /api/policies will trigger this
router.post('/', upload({
    field: "document",
    prefix: "policy-doc",
    uploadDir: "public/uploads/policies",
    allowedTypes: [
        "application/pdf", 
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ] 
}), create);

// --- READ ALL Route ---
// A GET request to /api/policies
router.get('/', findAll);

// --- READ ONE Route ---
// A GET request to /api/policies/:id
router.get('/:id', findOne);

// --- UPDATE Route ---
// A PUT request to /api/policies/:id
router.put('/:id', upload({
    field: "document",
    prefix: "policy-doc",
    uploadDir: "public/uploads/policies",
    allowedTypes: [
        "application/pdf", 
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
}), update);

// --- TOGGLE STATUS Route ---
// A PATCH request to /api/policies/status/:id
router.patch('/status/:id', toggleStatus);

// --- UPDATE ORDER Route ---
// A PUT request to /api/policies/order
router.put('/order', updateOrder);

// --- DELETE (Soft Delete) Route ---
// A DELETE request to /api/policies/:id
router.delete('/:id', destroy);

export default router;