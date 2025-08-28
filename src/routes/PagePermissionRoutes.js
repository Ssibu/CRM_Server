import { Router } from "express";
import {
  getPermissionData,
  assignPermissions,
  getUserPermissions,
  getPermissionPages,
  getPermissionUsers
} from "../controllers/PagePermissionController.js";
import {hasPermission} from "../middlewares/AuthMiddleware.js"
import authMiddleware from "../middlewares/AuthMiddleware.js"

const router = Router();
// router.use(authMiddleware)

router.get('/users', getPermissionUsers); // New route for just users
router.get('/pages', getPermissionPages);

router.get("/data",
    //  hasPermission("AR"), 
     getPermissionData);

router.get("/user/:userId", getUserPermissions);

router.post("/assign", assignPermissions);

export default router;