import { Router } from "express";
import {
  getPermissionData,
  assignPermissions,
  getUserPermissions,
  getPermissionPages,
  getPermissionUsers
} from "../controllers/PagePermissionController.js";
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = Router();
router.use(auth).use(hp("PP"))

router.get('/users', getPermissionUsers); 
router.get('/pages', getPermissionPages);

router.get("/data",
     getPermissionData);

router.get("/user/:userId", getUserPermissions);

router.post("/assign", assignPermissions);

export default router;