import express from 'express';
import { getDirectorDesk, updateDirectorDesk } from '../controllers/DirectorDeskController.js';
import upload from "../middlewares/UploadMiddleware.js"
import {auth, hp} from "..//middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("DD"))


const img = upload({
  mode: 'fields',
  field: [
    { name: 'logo', maxCount: 1 },  
    { name: 'photo', maxCount: 1 }, 
  ],
  uploadDir: 'public/uploads/director-desk',
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: 1024 * 1024, 
  prefix: 'dd',
  resize: true,
  width: 500,
  height: 500,
});

router.route('/')
    .get(getDirectorDesk)
    .patch(img, updateDirectorDesk);

export default router;