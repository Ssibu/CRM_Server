
import express from 'express';
import {
  getAllMenus,
  createMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
   updateMenuOrder,
     updateMenuStatus 
} from '../controllers/MenuController.js';

// File upload middleware

import { fileHandler } from '../middlewares/UploadMiddleware2.js';
const menuUpload = fileHandler({
  uploadDir: "public/uploads/menus",
  prefix: "menu"
});
const router = express.Router();

router.get('/', getAllMenus);


router.post('/', menuUpload, createMenu);


router.get('/:id', getMenuById);

router.put('/order', updateMenuOrder);
router.put('/:id', menuUpload, updateMenu);


router.delete('/:id', deleteMenu);
router.put('/status/:id', updateMenuStatus);

export default router;