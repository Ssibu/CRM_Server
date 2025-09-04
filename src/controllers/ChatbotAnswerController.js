import models from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../config/db.js';

const { ChatbotAnswer, ChatbotCategory, ChatbotQuestion } = models;

// Get all answers with pagination, search, and filters
export const getAnswers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const category_id = req.query.category_id || '';
    const question_id = req.query.question_id || '';
    const offset = (page - 1) * limit;

    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { en: { [Op.like]: `%${search}%` } },
          { od: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    if (category_id) whereCondition.category_id = category_id;
    if (question_id) whereCondition.question_id = question_id;

    const { count, rows: answers } = await ChatbotAnswer.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: ChatbotCategory,
          as: 'category',
          attributes: ['id', 'en', 'od']
        },
        {
          model: ChatbotQuestion,
          as: 'question',
          attributes: ['id', 'en', 'od']
        }
      ]
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
    console.error('Error fetching answers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching answers',
      error: error.message
    });
  }
};

// Get single answer
export const getAnswer = async (req, res) => {
  try {
    const answer = await ChatbotAnswer.findByPk(req.params.id, {
      include: [
        {
          model: ChatbotCategory,
          as: 'category',
          attributes: ['id', 'en', 'od']
        },
        {
          model: ChatbotQuestion,
          as: 'question',
          attributes: ['id', 'en', 'od']
        }
      ]
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
    console.error('Error fetching answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching answer',
      error: error.message
    });
  }
};

// Create new answer
export const createAnswer = async (req, res) => {
  try {
    let { category_id, question_id, en, od, status = 'Active' } = req.body;

    // Trim and validate input
    en = en ? en.trim() : "";
    od = od ? od.trim() : "";

    if (!category_id || !question_id || !en || !od) {
      return res.status(400).json({
        success: false,
        message: 'Category, question, and both answers are required'
      });
    }

    if (en.length < 2 || od.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Both English and Odia answers must be at least 2 characters long'
      });
    }

    const category = await ChatbotCategory.findByPk(category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const question = await ChatbotQuestion.findOne({
      where: { id: question_id, category_id }
    });
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question or question does not belong to selected category'
      });
    }

    const existingAnswer = await ChatbotAnswer.findOne({
      where: { question_id }
    });
    if (existingAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Answer already exists for this question'
      });
    }

    const answer = await ChatbotAnswer.create({
      category_id,
      question_id,
      en,
      od,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Answer created successfully',
      answer
    });
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating answer',
      error: error.message
    });
  }
};

// Update answer
export const updateAnswer = async (req, res) => {
  try {
    const answer = await ChatbotAnswer.findByPk(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    let { en, od, status } = req.body;

    // Trim and validate input if provided
    if (en !== undefined) {
      en = en.trim();
      if (!en || en.length < 2) {
        return res.status(400).json({
          success: false,
          message: "English answer must be at least 2 characters long",
        });
      }
    }

    if (od !== undefined) {
      od = od.trim();
      if (!od || od.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Odia answer must be at least 2 characters long",
        });
      }
    }

    if (en !== undefined) answer.en = en;
    if (od !== undefined) answer.od = od;
    if (status !== undefined) answer.status = status;

    await answer.save();

    const updatedAnswer = await ChatbotAnswer.findByPk(answer.id, {
      include: [
        {
          model: ChatbotCategory,
          as: 'category',
          attributes: ['id', 'en', 'od']
        },
        {
          model: ChatbotQuestion,
          as: 'question',
          attributes: ['id', 'en', 'od']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Answer updated successfully',
      answer: updatedAnswer
    });
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating answer',
      error: error.message
    });
  }
};

// Delete answer
export const deleteAnswer = async (req, res) => {
  try {
    const answer = await ChatbotAnswer.findByPk(req.params.id);

    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    await answer.destroy();

    res.json({
      success: true,
      message: 'Answer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting answer',
      error: error.message
    });
  }
};

// Get answers by category
export const getAnswersByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const answers = await ChatbotAnswer.findAll({
      where: { category_id, status: 'Active' },
      include: [
        {
          model: ChatbotQuestion,
          as: 'question',
          attributes: ['id', 'en', 'od']
        }
      ]
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

// Get answers by question
export const getAnswersByQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;

    const answers = await ChatbotAnswer.findAll({
      where: { question_id, status: 'Active' },
      include: [
        {
          model: ChatbotCategory,
          as: 'category',
          attributes: ['id', 'en', 'od']
        }
      ]
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

// Get questions by category for dropdown
export const getQuestionsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const questions = await ChatbotQuestion.findAll({
      where: { category_id, status: 'Active' },
      attributes: ['id', 'en', 'od'],
      order: [['en', 'ASC']]
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