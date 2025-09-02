import express from 'express';
import { getHomeAdmins, updateHomeAdmins } from '../controllers/HomeAdminController.js';
import upload from '../middlewares/UploadMiddleware.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"


const router = express.Router();
router.use(auth).use(hp("HA"))


const img = upload({
  mode: 'array',
  field: 'images', 
  maxCount: 3,    
  uploadDir: 'public/uploads/home-admins',
  allowedTypes: ['image/'],
  maxSize: 1024 * 1024, 
  prefix: 'ha',
  resize: true,
  width: 400,
  height: 400,
});

router.route('/')
    .get(getHomeAdmins)
    .patch(img, updateHomeAdmins);

export default router;