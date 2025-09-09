import express from "express";
import upload from "../../middlewares/UploadMiddleware.js"; // Correctly import the configured middleware
import {
  createLink,
  getLinks,
  getLinkById,
  updateLink
} from "../../controllers/Admin/GeneratedLinkController.js";
import {auth, hp} from "../../middlewares/AuthMiddleware.js"

const router = express.Router();

router.use(auth).use(hp("GL"))
const generatedLinkUpload = upload({
  mode: 'single',        // We only expect one file
  field: 'file',         // The frontend will use the field name 'file'
  
  uploadDir: 'public/uploads/generated-links', // A dedicated, organized directory

  

  maxSize: 5 * 1024 * 1024, // 5MB limit
  prefix: 'link-file',       // A clear prefix for filenames
  resize: false,             // Do not resize non-image files
});

// Route to get all links and create a new one
router.route('/')
    .get(getLinks)
    .post(generatedLinkUpload, createLink);

// Routes for a specific link by ID
router.route('/:id')
    .get(getLinkById)
    .put(generatedLinkUpload, updateLink) // Use PATCH for updates

export default router;