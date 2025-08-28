
import express from 'express';
import {
  createSubSubMenu,
  getAllSubSubMenus,
  getSubSubMenuById,
  updateSubSubMenu,
  deleteSubSubMenu,
  updateSubSubMenuOrder,
    updateSubSubMenuStatus
} from '../controllers/SubSubMenuController.js';

const router = express.Router();

import { fileHandler } from '../middlewares/UploadMiddleware2.js';

const subSubMenuUpload = fileHandler({
  uploadDir: "public/uploads/subsubmenus",
  prefix: "subsubmenu"
});
// Routes for /api/subsubmenus
router.route('/')
    .get(getAllSubSubMenus)
 
    .post(subSubMenuUpload, createSubSubMenu);
    router.put('/status/:id', updateSubSubMenuStatus);

// Routes for /api/subsubmenus/:id
router.route('/:id')
    .get(getSubSubMenuById)
    .put(subSubMenuUpload, updateSubSubMenu)
    .delete(deleteSubSubMenu);

// Route for /api/subsubmenus/order
router.put('/order', updateSubSubMenuOrder);

export default router;