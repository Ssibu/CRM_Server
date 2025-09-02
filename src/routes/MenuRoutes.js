
import express from 'express';
import {
  getAllMenus,
  createMenu,
  getMenuById,
  updateMenu,

     updateMenuStatus ,
     getAllMenusForSort, updateMenuOrder, getAllMenusForTree
} from '../controllers/MenuController.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"


import upload from '../middlewares/UploadMiddleware.js';
const menuUpload = upload({
  uploadDir: "public/uploads/menus",
  prefix: "menu",

  field: "image", 
});
const router = express.Router();
router.use(auth).use(hp("MS"))

router.get('/', getAllMenus);

router.get("/tree", getAllMenusForTree)


router.post('/', menuUpload, createMenu);

router.get('/all', getAllMenusForSort); 
router.put('/order', updateMenuOrder);

router.get('/:id', getMenuById);


router.put('/:id', menuUpload, updateMenu);



router.put('/status/:id', updateMenuStatus);

export default router;

