import models from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/db.js';

const { ChatbotQuestion, ChatbotCategory } = models;

export const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "order";
    const sortOrder = req.query.order || "ASC";

    const allowedSortColumns = ["en_question", "od_question", "status", "category_name", "order", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_question: { [Op.like]: `%${search}%` } },
          { od_question: { [Op.like]: `%${search}%` } },
          { '$category.en_title$': { [Op.like]: `%${search}%` } }, // Use the correct alias here
        ],
      })
    };
    
    // --- THIS IS THE FIX ---
    // The alias for sorting on the joined table must match the 'as' in the association.
    const order = sortBy === 'category_name'
        ? [[{ model: ChatbotCategory, as: 'category' }, 'en_title', sortOrder.toUpperCase()]]
        : [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await ChatbotQuestion.findAndCountAll({
      where: whereClause,
      include: [{
        model: ChatbotCategory,
        as: 'category', // Use the correct alias 'category'
        attributes: [],
      }],
      attributes: {
        include: [
            // Use the correct alias here to create the flattened property
            [sequelize.col('category.en_title'), 'category_name']
        ]
      },
      order,
      limit,
      offset,
      distinct: true,
    });

    res.status(200).json({
      total: count,
      data: rows,
    });

  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Error fetching questions" });
  }
};

// Get questions by category (💡 new function to fix error)
export const getQuestionsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    if (!category_id) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const questions = await ChatbotQuestion.findAll({
      where: { category_id },
      order: [["order", "ASC"]],
    });

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("Error fetching questions by category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching questions by category",
      error: error.message,
    });
  }
};

// Get single question
export const getQuestion = async (req, res) => {
  try {
    const question = await ChatbotQuestion.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching question",
      error: error.message,
    });
  }
};

// Create new question
// Create new question
export const createQuestion = async (req, res) => {
  try {
    const { en_question, od_question, category_id, status = "Active", order } = req.body;

    if (!en_question || !od_question || !category_id) {
      return res.status(400).json({
        success: false,
        message: "English, Odia, and category_id are required",
      });
    }

    // Find highest order for that category
    const highestOrder = await ChatbotQuestion.findOne({
      where: { category_id },
      order: [["order", "DESC"]],
    });

    const newOrder = order ?? (highestOrder ? highestOrder.order + 1 : 0);

    const question = await ChatbotQuestion.create({
      en_question,
      od_question,
      category_id,   // ✅ expects camelCase
      status,
      order: newOrder,
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({
      success: false,
      message: "Error creating question",
      error: error.message,
    });
  }
};


// Update question
export const updateQuestion = async (req, res) => {
  try {
    const question = await ChatbotQuestion.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const { en_question, od_question, category_id, status, order } = req.body;

    if (en_question !== undefined) question.en_question = en_question;
    if (od_question !== undefined) question.od_question = od_question;
    if (category_id !== undefined) question.category_id = category_id;
    if (status !== undefined) question.status = status;
    if (order !== undefined) question.order = order;

    await question.save();

    res.json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({
      success: false,
      message: "Error updating question",
      error: error.message,
    });
  }
};

// Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const question = await ChatbotQuestion.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    await question.destroy();

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting question",
      error: error.message,
    });
  }
};

// Update order of multiple questions
export const updateQuestionOrder = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Questions array is required",
      });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await ChatbotQuestion.update(
        { order: i },
        { where: { id: q.id } }
      );
    }

    res.json({
      success: true,
      message: "Question order updated successfully",
    });
  } catch (error) {
    console.error("Error updating question order:", error);
    res.status(500).json({
      success: false,
      message: "Error updating question order",
      error: error.message,
    });
  }
};
