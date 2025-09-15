
import express from 'express';
import {
  createSubSubMenu,
  getAllSubSubMenus,
  getSubSubMenuById,
  updateSubSubMenu,

    updateSubSubMenuStatus,
    getAllSubSubMenusForSort, getAllSubSubMenusWithoutPagination ,updateSubSubMenuOrder
} from '../../controllers/Admin/SubSubMenuController.js';
import {auth, hp} from "../../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("SSMS"))

import upload from '../../middlewares/UploadMiddleware.js';

const subSubMenuUpload = upload({
  uploadDir: "public/uploads/subsubmenus",
  prefix: "subsubmenu",
  field: "image",
      width :800,
    height :600,
     maxSize: 10 * 1024 * 1024,
});
// Routes for /api/subsubmenus
router.route('/')
    .get(getAllSubSubMenus)
 
    .post(subSubMenuUpload, createSubSubMenu);
      router.get('/list', getAllSubSubMenusWithoutPagination);
    router.put('/status/:id', updateSubSubMenuStatus);
    router.get('/all', getAllSubSubMenusForSort);
router.put('/order', updateSubSubMenuOrder);


// Routes for /api/subsubmenus/:id
router.route('/:id')
    .get(getSubSubMenuById)
    .put(subSubMenuUpload, updateSubSubMenu)



export default router;