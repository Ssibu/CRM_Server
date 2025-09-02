import express from 'express';
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("CA"))

// Import controller functions
import {
  getAnswers,
  getAnswer,
  createAnswer,
  updateAnswer,
  deleteAnswer, // ✅ Ensure this is imported
  getAnswersByCategory,
  getAnswersByQuestion,
  getQuestionsByCategory
} from '../controllers/ChatbotAnswerController.js';

// All routes will be under /api/chatbot-answers
router.get('/', getAnswers);
router.get('/:id', getAnswer);
router.post('/', createAnswer);
router.put('/:id', updateAnswer);
router.delete('/:id', deleteAnswer); // ✅ Ensure this route exists
router.get('/category/:category_id', getAnswersByCategory);
router.get('/question/:question_id', getAnswersByQuestion);
router.get('/questions/:category_id', getQuestionsByCategory);

export default router;