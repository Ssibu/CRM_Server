
import express from 'express';
import {
  getAllMenus,
  createMenu,
  getMenuById,
  updateMenu,

     updateMenuStatus ,
     getAllMenusForSort, updateMenuOrder,getAllMenusWithoutPagination, getAllMenusForTree
} from '../../controllers/Admin/MenuController.js';
import {auth, hp} from "../../middlewares/AuthMiddleware.js"


import upload from '../../middlewares/UploadMiddleware.js';
const menuUpload = upload({
  uploadDir: "public/uploads/menus",
  prefix: "menu",
    width :800,
    height :600,
  field: "image", 
    maxSize: 10 * 1024 * 1024,
});
const router = express.Router();
router.use(auth).use(hp("MS"))

router.get('/', getAllMenus);
router.get('/list', getAllMenusWithoutPagination);
router.get("/tree", getAllMenusForTree)


router.post('/', menuUpload, createMenu);

router.get('/all', getAllMenusForSort); 
router.put('/order', updateMenuOrder);

router.get('/:id', getMenuById);


router.put('/:id', menuUpload, updateMenu);



router.put('/status/:id', updateMenuStatus);

export default router;

