import models from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/db.js';
import { log } from '../../services/LogService.js';

const [LIST, EDIT, ADD, C, R, U] = [
  "CHATBOT ANSWER LIST",
  "CHATBOT ANSWER EDIT",
  "CHATBOT ANSWER ADD",
  "CREATE",
  "READ",
  "UPDATE"
];

const { ChatbotAnswer, ChatbotCategory, ChatbotQuestion } = models;

export const getAnswers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_answer", "od_answer", "status", "category_name", "question_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_answer: { [Op.like]: `%${search}%` } },
          { od_answer: { [Op.like]: `%${search}%` } },
          { '$category.en_title$': { [Op.like]: `%${search}%` } },
          { '$question.en_question$': { [Op.like]: `%${search}%` } },
        ],
      })
    };

    let order;
    if (sortBy === 'category_name') {
        order = [[{ model: ChatbotCategory, as: 'category' }, 'en_title', sortOrder.toUpperCase()]];
    } else if (sortBy === 'question_name') {
        order = [[{ model: ChatbotQuestion, as: 'question' }, 'en_question', sortOrder.toUpperCase()]];
    } else {
        order = [[sortBy, sortOrder.toUpperCase()]];
    }
    
    const { count, rows } = await ChatbotAnswer.findAndCountAll({
      where: whereClause,
      include: [
        { model: ChatbotCategory, as: 'category', attributes: [] },
        { model: ChatbotQuestion, as: 'question', attributes: [] }
      ],
      attributes: {
        include: [
            [sequelize.col('category.en_title'), 'category_name'],
            [sequelize.col('question.en_question'), 'question_name']
        ]
      },
      order,
      limit,
      offset,
      distinct: true,
    });

      await log({
              req,
              action: R,
              page_name: LIST,
            });

    res.status(200).json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error('Error fetching answers:', error);
    res.status(500).json({ message: 'Error fetching answers' });
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
          attributes: ['id', 'en_title', 'od_title'] // ye theek hona chahiye
        },
        {
          model: ChatbotQuestion,
          as: 'question',
          attributes: ['id', 'en_question', 'od_question'] // yeh sahi hone chahiye
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
    let { category_id, question_id, en_answer, od_answer, status = 'Active' } = req.body;

    // Trim and validate input
    en_answer = en_answer ? en_answer.trim() : "";
    od_answer = od_answer ? od_answer.trim() : "";

    if (!category_id || !question_id || !en_answer || !od_answer) {
      return res.status(400).json({
        success: false,
        message: 'Category, question, and both answers are required'
      });
    }

    if (en_answer.length < 2 || od_answer.length < 2) {
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
      en_answer,
      od_answer,
      status
    });

      await log({
              req,
              action: C,
              page_name: ADD,
              target: answer.en_answer
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

    let { en_answer, od_answer, status } = req.body;

    // Trim and validate input if provided
    if (en_answer !== undefined) {
      en_answer = en_answer.trim();
      if (!en_answer || en_answer.length < 2) {
        return res.status(400).json({
          success: false,
          message: "English answer must be at least 2 characters long",
        });
      }
    }

    if (od_answer !== undefined) {
      od_answer = od_answer.trim();
      if (!od_answer || od_answer.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Odia answer must be at least 2 characters long",
        });
      }
    }

    if (en_answer !== undefined) answer.en_answer = en_answer;
    if (od_answer !== undefined) answer.od_answer = od_answer;
    if (status !== undefined) answer.status = status;

    await answer.save();

    const updatedAnswer = await ChatbotAnswer.findByPk(answer.id, {
      include: [
        {
          model: ChatbotCategory,
          as: 'category',
          attributes: ['id', 'en_title', 'od_title']
        },
        {
          model: ChatbotQuestion,
          as: 'question',
          attributes: ['id', 'en_question', 'od_question']
        }
      ]
    });

          await log({
              req,
              action: U,
              page_name: EDIT,
              target: answer.en_answer
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
          attributes: ['id', 'en_answer', 'od_answer']
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

export const getAnswersByQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;

    const answers = await ChatbotAnswer.findAll({
      where: { question_id, status: 'Active' },
      include: [
        {
          model: ChatbotCategory,
          as: 'category',
          attributes: ['id', 'en_title', 'od_title'] // fix kiya yahan
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


export const getQuestionsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const questions = await ChatbotQuestion.findAll({
      where: { category_id, status: 'Active' },
      attributes: ['id', 'en_question', 'od_question'], // fix kiya yahan
      order: [['en_question', 'ASC']]
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
