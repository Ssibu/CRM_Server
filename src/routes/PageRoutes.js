import express from "express";
import { createPage, getPages, getPageById, updatePage, togglePageStatus } from "../controllers/PageController.js";
// import {authMiddleware, hasPermission} from "../middlewares/AuthMiddleware.js"

const router = express.Router();

// router.use(authMiddleware)

router.post("/", createPage);
router.get("/", 
	// hasPermission("AR"),
	 getPages);
router.get("/:id", getPageById);
router.patch("/:id/status", togglePageStatus);
router.put("/:id", updatePage);
// router.delete("/:id", deletePage);

export default router;
