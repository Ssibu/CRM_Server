import express from "express";
import { createPage, getPages, getPageById, updatePage, togglePageStatus } from "../controllers/PageController.js";
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();

router.use(auth).use(hp("P"))

router.post("/", createPage);
router.get("/", 
	 getPages);
router.get("/:id", getPageById);
router.patch("/:id/status", togglePageStatus);
router.put("/:id", updatePage);

export default router;
