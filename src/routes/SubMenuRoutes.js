// src/routes/SubMenuRoutes.js

import express from 'express';

// Controller 
import {
  createSubMenu,
  getAllSubMenus,
  getSubMenuById,
  updateSubMenu,
  deleteSubMenu,
    updateSubMenuStatus 
} from '../controllers/SubMenuController.js';
import { fileHandler } from '../middlewares/UploadMiddleware2.js';
// File 

const subMenuUpload = fileHandler({
  uploadDir: "public/uploads/submenus",
  prefix: "submenu"
});
const router = express.Router();
router.put('/status/:id', updateSubMenuStatus);

router.get('/', getAllSubMenus);

router.post('/', subMenuUpload, createSubMenu);

router.get('/:id', getSubMenuById);


router.put('/:id', subMenuUpload, updateSubMenu);


router.delete('/:id', deleteSubMenu);

export default router;


