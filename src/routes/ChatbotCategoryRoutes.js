import express from 'express';

const router = express.Router();

// Import controller functions
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  updateCategoryOrder
} from '../controllers/ChatbotCategoryController.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"


router.use(auth).use(hp("CC"))

// ✅ सभी routes /api/chatbot-categories के under होंगे
router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', createCategory); // ✅ यही route use हो रहा है
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.patch('/order', updateCategoryOrder);

export default router;