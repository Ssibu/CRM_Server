// src/routes/SubMenuRoutes.js

import express from 'express';

// Controller 
import {
  createSubMenu,
  getAllSubMenus,
  getSubMenuById,
  updateSubMenu,
getAllSubMenusWithoutPagination,
    updateSubMenuStatus ,
    getAllSubMenusForSort, updateSubMenuOrder,
} from '../../controllers/Admin/SubMenuController.js';
import { getAllMenus } from '../../controllers/Admin/MenuController.js';
import upload from '../../middlewares/UploadMiddleware.js';
import {auth, hp} from "../../middlewares/AuthMiddleware.js"
// File 

const subMenuUpload = upload({
  uploadDir: "public/uploads/submenus",
  prefix: "submenu",
    field: "image", 
        width :800,
    height :600,
     maxSize: 10 * 1024 * 1024,
});
const router = express.Router();
router.use(auth).use(hp("SMS"))
router.get('/list', getAllSubMenusWithoutPagination);
router.put('/status/:id', updateSubMenuStatus);

router.get('/', getAllSubMenus);
router.get("/menu-list", getAllMenus)

router.get('/all', getAllSubMenusForSort);
router.put('/order', updateSubMenuOrder);

router.post('/', subMenuUpload, createSubMenu);

router.get('/:id', getSubMenuById);


router.put('/:id', subMenuUpload, updateSubMenu);




export default router;


