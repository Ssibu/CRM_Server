import express from 'express';
const router = express.Router();

// Import controller functions
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  updateQuestionOrder,
  getQuestionsByCategory
} from '../controllers/ChatbotQuestionController.js';

// All routes will be under /api/chatbot-questions
router.get('/', getQuestions);
router.get('/category/:category_id', getQuestionsByCategory);
router.get('/:id', getQuestion);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);
router.patch('/order', updateQuestionOrder);
router.get('/category/:category_id', getQuestionsByCategory);

export default router;