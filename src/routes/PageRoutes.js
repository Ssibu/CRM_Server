import express from "express";
import { createPage, getPages, updatePage, deletePage } from "../controllers/PageController.js";

const router = express.Router();

router.post("/", createPage);
router.get("/", getPages);
router.put("/:id", updatePage);
router.delete("/:id", deletePage);

export default router;
