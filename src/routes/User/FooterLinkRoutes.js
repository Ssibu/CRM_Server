// src/routes/User/FooterLinkRoutes.js
import express from "express";
import { getLinksByCategory } from "../../controllers/User/FooterLinkController.js";

const router = express.Router();

// Example: /api/footer-links/ImportantLink
// Example: /api/footer-links/UsefulLink
router.get("/:category", getLinksByCategory);

export default router;
