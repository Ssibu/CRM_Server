import express from 'express';
import {
    listCorrigendumsForTender,
    addCorrigendum,
    getCorrigendumById,
    updateCorrigendum,
    toggleCorrigendumStatus,
} from '../controllers/CorrigendumController.js';
import upload from "../middlewares/UploadMiddleware.js"





const router = express.Router();



const doc =  upload({
    mode: 'single', // We only have one file field: 'cor_document'
  field: 'cor_document',
  uploadDir: 'public/uploads/tenders/corrigendums',
  allowedTypes: ['application/pdf'],
  maxSize: 1 * 1024 * 1024, // 1MB
  prefix: 'corrigendum',
  resize: false, 
  });

// Routes related to a specific TENDER
router.route('/tenders/:tenderId/corrigendums')
    .get(listCorrigendumsForTender)
    .post(doc, addCorrigendum);

// Routes for a specific CORRIGENDUM by its own ID
router.route('/corrigendums/:id')
    .get(getCorrigendumById)
    .patch(doc, updateCorrigendum);

router.patch('/corrigendums/:id/status', toggleCorrigendumStatus);

export default router;