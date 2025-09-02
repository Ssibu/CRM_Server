import express from 'express';
import { addTender, listTenders, toggleTenderStatus, getTenderById, updateTender } from '../controllers/TenderController.js';
import upload from "../middlewares/UploadMiddleware.js"
import {auth, hp} from "../middlewares/AuthMiddleware.js"



const router = express.Router();
router.use(auth).use(hp("NT"))

const doc =  upload({
    mode: 'fields', 
    
    field: [
      { name: 'nit_doc', maxCount: 1 },
      { name: 'doc', maxCount: 1 },
    ],
    
    uploadDir: 'public/uploads/tenders',

    allowedTypes: ['application/pdf'],

    maxSize: 1 * 1024 * 1024,

    prefix: 'tender',

    resize: false,
  });


router.post(
  '/',
 doc,
  addTender
);

router.get('/', listTenders);
router.patch('/:id/status', toggleTenderStatus);

router.get('/:id', getTenderById);
router.patch('/:id', doc, updateTender);


export default router;