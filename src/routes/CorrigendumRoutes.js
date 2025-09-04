import express from 'express';
import {
    listCorrigendumsForTender,
    addCorrigendum,
    getCorrigendumById,
    updateCorrigendum,
    toggleCorrigendumStatus,
} from '../controllers/CorrigendumController.js';
import upload from "../middlewares/UploadMiddleware.js"
import {auth, hp} from "../middlewares/AuthMiddleware.js"





const router = express.Router();
router.use(auth).use(hp("NT"))


const doc =  upload({
    mode: 'single',
  field: 'cor_document',
  uploadDir: 'public/uploads/tenders/corrigendums',
  allowedTypes: ['application/pdf'],
  maxSize: 1 * 1024 * 1024, 
  prefix: 'corrigendum',
  resize: false, 
  });

router.route('/tenders/:tenderId/corrigendums')
    .get(listCorrigendumsForTender)
    .post(doc, addCorrigendum);

router.route('/corrigendums/:id')
    .get(getCorrigendumById)
    .patch(doc, updateCorrigendum);

router.patch('/corrigendums/:id/status', toggleCorrigendumStatus);

export default router;