// import express from 'express';
// import {
//   getAllLinks,
//   getLink,
//   createLink,
//   updateLink,
//   deleteLink,
//   updateStatus
// } from '../../controllers/Admin/ImportantLinkController.js';
// import upload from '../middlewares/UploadMiddleware.js'; 
// import {auth, hp} from "../middlewares/AuthMiddleware.js"

// const router = express.Router();
// router.use(auth).use(hp("IL"))

// // Configure upload middleware for important links
// const uploadMiddleware = upload({
//   field: 'image',
//   uploadDir: 'public/uploads/important-links',
//   prefix: 'important-link'
// });

// // Routes
// router.get('/', getAllLinks);
// router.get('/:id', getLink);
// router.post('/', uploadMiddleware, createLink);
// router.put('/:id', uploadMiddleware, updateLink);
// router.delete('/:id', deleteLink);
// router.patch('/:id/status', updateStatus);

// export default router;


import express from 'express';


import { getAllImportantLinks, getImportantLinkById, registerImportantLink, toggleImportantLinkStatus, updateImportantLink } from '../../controllers/Admin/ImportantLinkController.js';
import upload from '../../middlewares/UploadMiddleware.js';
import { auth, hp } from '../../middlewares/AuthMiddleware.js';

const importantLinkRouter = express.Router();

// 🛡️ Auth and permission middleware
importantLinkRouter.use(auth).use(hp("IL"));

// 📦 Upload middleware
// const uploadImage = upload({
//   mode: 'single',
//   field: 'image',
//   uploadDir: 'public/uploads/important-links',
//   prefix: 'important-link',
//   allowedTypes: ['image/'],
//   maxSize: 10 * 1024 * 1024,
//   resize: true,
//   width: 400,
//   height: 400,
// });
const uploadImage = upload({
  mode: 'single',
  field: 'image',
  uploadDir: 'public/uploads/important-links',
  prefix: 'important-link',
  allowedTypes: ['image/'],
  maxSize: 10 * 1024 * 1024, // 10MB max size
  resize: true,
  width: 800,
  height: 600,
});


//
// 🔗 IMPORTANT LINK ROUTES
//

// GET - Fetch all important links
importantLinkRouter.get('/importantlinks', getAllImportantLinks);

// GET - Fetch single important link by ID
importantLinkRouter.get('/importantlinks/:id', getImportantLinkById);

// POST - Register a new important link (with optional image)
importantLinkRouter.post('/importantlinks/register', ...uploadImage, registerImportantLink);

// PUT - Update an existing important link (optionally replace image)
importantLinkRouter.put('/importantlinks/update/:id', ...uploadImage, updateImportantLink);

// PATCH - Toggle status (active/inactive) of an important link
importantLinkRouter.patch('/importantlinks/:id/status', toggleImportantLinkStatus);

export default importantLinkRouter;
