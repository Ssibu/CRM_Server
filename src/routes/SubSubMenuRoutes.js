
import express from 'express';
import {
  createSubSubMenu,
  getAllSubSubMenus,
  getSubSubMenuById,
  updateSubSubMenu,

    updateSubSubMenuStatus,
    getAllSubSubMenusForSort, updateSubSubMenuOrder
} from '../controllers/SubSubMenuController.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("SSMS"))

import upload from '../middlewares/UploadMiddleware.js';

const subSubMenuUpload = upload({
  uploadDir: "public/uploads/subsubmenus",
  prefix: "subsubmenu",
  field: "image"
});
// Routes for /api/subsubmenus
router.route('/')
    .get(getAllSubSubMenus)
 
    .post(subSubMenuUpload, createSubSubMenu);
    router.put('/status/:id', updateSubSubMenuStatus);
    router.get('/all', getAllSubSubMenusForSort);
router.put('/order', updateSubSubMenuOrder);


// Routes for /api/subsubmenus/:id
router.route('/:id')
    .get(getSubSubMenuById)
    .put(subSubMenuUpload, updateSubSubMenu)



export default router;