import express from 'express';
import { 
    addNotice, 
    listNotices, 
    toggleNoticeStatus, 
    getNoticeById, 
    updateNotice 
} from '../controllers/NoticeController.js';
import upload from "../middlewares/UploadMiddleware.js"
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("NN"))

const doc = upload({
  mode: 'single', 
  field: 'doc',   
  
  uploadDir: 'public/uploads/notices', 

  allowedTypes: ['application/pdf'], 
  maxSize: 1 * 1024 * 1024,         
  prefix: 'notice',                
  resize: false,                     
});

router.post('/', doc, addNotice);
router.get('/', listNotices);

router.get('/:id', getNoticeById);
router.patch('/:id', doc, updateNotice);
router.patch('/:id/status', toggleNoticeStatus);

export default router;