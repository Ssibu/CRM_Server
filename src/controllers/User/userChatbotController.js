

import models from '../../models/index.js';
import { Op } from 'sequelize';

const {
  ChatbotAnswer,
  ChatbotCategory,
  ChatbotQuestion
} = models;

// Get answers by question (FIXED VERSION)
export const getAnswersByQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { status } = req.query;
    
    let whereCondition = { question_id };
    
    if (status) whereCondition.status = status;

    const answers = await ChatbotAnswer.findAll({
      where: whereCondition,
      attributes: ['id', 'category_id', 'question_id', 'en_answer', 'od_answer', 'status']
    });

    res.json({
      success: true,
      answers
    });
  } catch (error) {
    console.error('Error fetching answers by question:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching answers by question',
      error: error.message
    });
  }
};

// Get all chatbot answers
export const getChatbotAnswers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category_id = req.query.category_id || '';
    const question_id = req.query.question_id || '';
    const status = req.query.status || '';
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { en_answer: { [Op.like]: `%${search}%` } },
        { od_answer: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category_id) whereCondition.category_id = category_id;
    if (question_id) whereCondition.question_id = question_id;
    if (status) whereCondition.status = status;

    const { count, rows: answers } = await ChatbotAnswer.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'category_id', 'question_id', 'en_answer', 'od_answer', 'status', 'createdAt', 'updatedAt']
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      answers,
      totalAnswers: count,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching chatbot answers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chatbot answers',
      error: error.message
    });
  }
};

// Get all chatbot categories
export const getChatbotCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { en_title: { [Op.like]: `%${search}%` } },
        { od_title: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) whereCondition.status = status;

    const { count, rows: categories } = await ChatbotCategory.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['order', 'ASC']],
      attributes: ['id', 'en_title', 'od_title', 'status', 'image', 'order']
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      categories,
      totalCategories: count,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching chatbot categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chatbot categories',
      error: error.message
    });
  }
};

// Get all chatbot questions
export const getChatbotQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const category_id = req.query.category_id || "";
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (search) {
      whereCondition[Op.or] = [
        { en_question: { [Op.like]: `%${search}%` } },
        { od_question: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status) whereCondition.status = status;
    if (category_id) whereCondition.category_id = category_id;

    const { count, rows: questions } = await ChatbotQuestion.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["order", "ASC"]],
      attributes: ['id', 'category_id', 'en_question', 'od_question', 'status', 'order']
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      questions,
      totalQuestions: count,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching chatbot questions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching chatbot questions",
      error: error.message,
    });
  }
};

// Get questions by category
export const getQuestionsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const { status } = req.query;
    
    let whereCondition = { category_id };
    
    if (status) whereCondition.status = status;

    const questions = await ChatbotQuestion.findAll({
      where: whereCondition,
      order: [['order', 'ASC']],
      attributes: ['id', 'category_id', 'en_question', 'od_question', 'status', 'order']
    });

    res.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions by category',
      error: error.message
    });
  }
};

// Get single answer by ID
export const getChatbotAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const answer = await ChatbotAnswer.findByPk(id, {
      attributes: ['id', 'category_id', 'question_id', 'en_answer', 'od_answer', 'status']
    });

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    res.json({
      success: true,
      answer
    });
  } catch (error) {
    console.error('Error fetching chatbot answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chatbot answer',
      error: error.message
    });
  }
};

// Get single category by ID
export const getChatbotCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ChatbotCategory.findByPk(id, {
      attributes: ['id', 'en_title', 'od_title', 'status', 'image', 'order']
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error fetching chatbot category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chatbot category',
      error: error.message
    });
  }
};

// Get single question by ID
export const getChatbotQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await ChatbotQuestion.findByPk(id, {
      attributes: ['id', 'category_id', 'en_question', 'od_question', 'status', 'order']
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Error fetching chatbot question:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chatbot question',
      error: error.message
    });
  }
};

// Get answers by category
export const getAnswersByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const { status } = req.query;
    
    let whereCondition = { category_id };
    
    if (status) whereCondition.status = status;

    const answers = await ChatbotAnswer.findAll({
      where: whereCondition,
      attributes: ['id', 'category_id', 'question_id', 'en_answer', 'od_answer', 'status']
    });

    res.json({
      success: true,
      answers
    });
  } catch (error) {
    console.error('Error fetching answers by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching answers by category',
      error: error.message
    });
  }
};