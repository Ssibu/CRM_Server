// import express from 'express';
// const router = express.Router();

// // Import controller functions
// import {
//   getAnswers,
//   getAnswer,
//   getAnswersByCategory,
//   getAnswersByQuestion,
//   getQuestionsByCategory
// } from '../../controllers/ChatbotAnswerController.js';

// import {
//   getCategories,
//   getCategory
// } from '../../controllers/ChatbotCategoryController.js';

// import {
//   getQuestions,
//   getQuestion,
//   getQuestionsByCategory as getCategoryQuestions
// } from '../../controllers/ChatbotQuestionController.js';

// // ✅ ANSWERS ROUTES (GET only)
// router.get('/answers', getAnswers);
// router.get('/answers/:id', getAnswer);
// router.get('/answers/category/:category_id', getAnswersByCategory);
// router.get('/answers/question/:question_id', getAnswersByQuestion);
// router.get('/answers/questions/:category_id', getQuestionsByCategory);

// // ✅ CATEGORIES ROUTES (GET only)
// router.get('/categories', getCategories);
// router.get('/categories/:id', getCategory);

// // ✅ QUESTIONS ROUTES (GET only)
// router.get('/questions', getQuestions);
// router.get('/questions/:id', getQuestion);
// router.get('/questions/category/:category_id', getCategoryQuestions);

// export default router;

import express from 'express';
const router = express.Router();

// Import controller functions
import {
  getChatbotAnswers,
  getChatbotAnswer,
  getAnswersByCategory,
  getAnswersByQuestion,
  getQuestionsByCategory,
  getChatbotCategories,
  getChatbotCategory,
  getChatbotQuestions,
  getChatbotQuestion
} from '../../controllers/User/userChatbotController.js';

// ✅ ANSWERS ROUTES
router.get('/answers', getChatbotAnswers);
router.get('/answers/:id', getChatbotAnswer);
router.get('/answers/category/:category_id', getAnswersByCategory);
router.get('/answers/question/:question_id', getAnswersByQuestion);
router.get('/answers/questions/:category_id', getQuestionsByCategory);

// ✅ CATEGORIES ROUTES
router.get('/categories', getChatbotCategories);
router.get('/categories/:id', getChatbotCategory);

// ✅ QUESTIONS ROUTES
router.get('/questions', getChatbotQuestions);
router.get('/questions/:id', getChatbotQuestion);
router.get('/questions/category/:category_id', getQuestionsByCategory);

export default router;