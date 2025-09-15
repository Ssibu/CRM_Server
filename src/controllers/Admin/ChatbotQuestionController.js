// import models from '../../models/index.js';
// import { Op } from 'sequelize';
// import sequelize from '../../../config/db.js';
// import {log} from "../../services/LogService.js"

// const [LIST, EDIT, ADD, C, R, U] = [
//   "CHATBOT QUESTION LIST",
//   "CHATBOT QUESTION EDIT",
//   "CHATBOT QUESTION ADD",
//   "CREATE",
//   "READ",
//   "UPDATE"
// ];

// const { ChatbotQuestion, ChatbotCategory } = models;

// export const getQuestions = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = req.query.search || "";
//     const sortBy = req.query.sort || "order";
//     const sortOrder = req.query.order || "ASC";

//     const allowedSortColumns = ["en_question", "od_question", "status", "category_name", "order", "createdAt"];
//     if (!allowedSortColumns.includes(sortBy)) {
//       return res.status(400).json({ message: "Invalid sort column" });
//     }

//     const offset = (page - 1) * limit;

//     const whereClause = {
//       ...(search && {
//         [Op.or]: [
//           { en_question: { [Op.like]: `%${search}%` } },
//           { od_question: { [Op.like]: `%${search}%` } },
//           { '$category.en_title$': { [Op.like]: `%${search}%` } }, // Use the correct alias here
//         ],
//       })
//     };
    
//     // --- THIS IS THE FIX ---
//     // The alias for sorting on the joined table must match the 'as' in the association.
//     const order = sortBy === 'category_name'
//         ? [[{ model: ChatbotCategory, as: 'category' }, 'en_title', sortOrder.toUpperCase()]]
//         : [[sortBy, sortOrder.toUpperCase()]];

//     const { count, rows } = await ChatbotQuestion.findAndCountAll({
//       where: whereClause,
//       include: [{
//         model: ChatbotCategory,
//         as: 'category', // Use the correct alias 'category'
//         attributes: [],
//       }],
//       attributes: {
//         include: [
//             // Use the correct alias here to create the flattened property
//             [sequelize.col('category.en_title'), 'category_name']
//         ]
//       },
//       order,
//       limit,
//       offset,
//       distinct: true,
//     });
    
//       await log({
//               req,
//               action: R,
//               page_name: LIST,
//             });

//     res.status(200).json({
//       total: count,
//       data: rows,
//     });

//   } catch (error) {
//     console.error("Error fetching questions:", error);
//     res.status(500).json({ message: "Error fetching questions" });
//   }
// };

// export const getQuestionsByCategory = async (req, res) => {
//   try {
//     const { category_id } = req.params;

//     if (!category_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Category ID is required",
//       });
//     }

//     const questions = await ChatbotQuestion.findAll({
//       where: { category_id },
//       order: [["order", "ASC"]],
//     });

//     res.json({
//       success: true,
//       questions,
//     });
//   } catch (error) {
//     console.error("Error fetching questions by category:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching questions by category",
//       error: error.message,
//     });
//   }
// };

// // Get single question
// export const getQuestion = async (req, res) => {
//   try {
//     const question = await ChatbotQuestion.findByPk(req.params.id);

//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     res.json({
//       success: true,
//       question,
//     });
//   } catch (error) {
//     console.error("Error fetching question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching question",
//       error: error.message,
//     });
//   }
// };

// // Create new question
// // Create new question
// export const createQuestion = async (req, res) => {
//   try {
//     const { en_question, od_question, category_id, status = "Active", order } = req.body;

//     if (!en_question || !od_question || !category_id) {
//       return res.status(400).json({
//         success: false,
//         message: "English, Odia, and category_id are required",
//       });
//     }

//     // Find highest order for that category
//     const highestOrder = await ChatbotQuestion.findOne({
//       where: { category_id },
//       order: [["order", "DESC"]],
//     });

//     const newOrder = order ?? (highestOrder ? highestOrder.order + 1 : 0);

//     const question = await ChatbotQuestion.create({
//       en_question,
//       od_question,
//       category_id,   // ✅ expects camelCase
//       status,
//       order: newOrder,
//     });

  

//       await log({
//               req,
//               action: C,
//               page_name: ADD,
//               target: question.en_question
//             });

//     res.status(201).json({
//       success: true,
//       message: "Question created successfully",
//       question,
//     });
//   } catch (error) {
//     console.error("Error creating question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating question",
//       error: error.message,
//     });
//   }
// };


// // Update question
// export const updateQuestion = async (req, res) => {
//   try {
//     const question = await ChatbotQuestion.findByPk(req.params.id);

//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     const { en_question, od_question, category_id, status, order } = req.body;

//     if (en_question !== undefined) question.en_question = en_question;
//     if (od_question !== undefined) question.od_question = od_question;
//     if (category_id !== undefined) question.category_id = category_id;
//     if (status !== undefined) question.status = status;
//     if (order !== undefined) question.order = order;

//     await question.save();

//       await log({
//               req,
//               action: U,
//               page_name: EDIT,
//               target: question.en_question
//             });

//     res.json({
//       success: true,
//       message: "Question updated successfully",
//       question,
//     });
//   } catch (error) {
//     console.error("Error updating question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating question",
//       error: error.message,
//     });
//   }
// };

// // Delete question
// export const deleteQuestion = async (req, res) => {
//   try {
//     const question = await ChatbotQuestion.findByPk(req.params.id);

//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     await question.destroy();

//     res.json({
//       success: true,
//       message: "Question deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error deleting question",
//       error: error.message,
//     });
//   }
// };

// // Update order of multiple questions
// export const updateQuestionOrder = async (req, res) => {
//   try {
//     const { questions } = req.body;

//     if (!questions || !Array.isArray(questions)) {
//       return res.status(400).json({
//         success: false,
//         message: "Questions array is required",
//       });
//     }

//     for (let i = 0; i < questions.length; i++) {
//       const q = questions[i];
//       await ChatbotQuestion.update(
//         { order: i },
//         { where: { id: q.id } }
//       );
//     }

//     res.json({
//       success: true,
//       message: "Question order updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating question order:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating question order",
//       error: error.message,
//     });
//   }
// };


// import models from '../../models/index.js';
// import { Op } from 'sequelize';
// import sequelize from '../../../config/db.js';
// import {log} from "../../services/LogService.js"

// const [LIST, EDIT, ADD, C, R, U] = [
//   "CHATBOT QUESTION LIST",
//   "CHATBOT QUESTION EDIT",
//   "CHATBOT QUESTION ADD",
//   "CREATE",
//   "READ",
//   "UPDATE"
// ];

// const { ChatbotQuestion, ChatbotCategory } = models;

// export const getQuestions = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = req.query.search || "";
//     const sortBy = req.query.sort || "order";
//     const sortOrder = req.query.order || "ASC";

//     const allowedSortColumns = ["en_question", "od_question", "status", "category_name", "order", "createdAt"];
//     if (!allowedSortColumns.includes(sortBy)) {
//       return res.status(400).json({ message: "Invalid sort column" });
//     }

//     const offset = (page - 1) * limit;

//     const whereClause = {
//       ...(search && {
//         [Op.or]: [
//           { en_question: { [Op.like]: `%${search}%` } },
//           { od_question: { [Op.like]: `%${search}%` } },
//           { '$category.en_title$': { [Op.like]: `%${search}%` } },
//         ],
//       })
//     };
    
//     const order = sortBy === 'category_name'
//         ? [[{ model: ChatbotCategory, as: 'category' }, 'en_title', sortOrder.toUpperCase()]]
//         : [[sortBy, sortOrder.toUpperCase()]];

//     const { count, rows } = await ChatbotQuestion.findAndCountAll({
//       where: whereClause,
//       include: [{
//         model: ChatbotCategory,
//         as: 'category',
//         attributes: [],
//       }],
//       attributes: {
//         include: [
//             [sequelize.col('category.en_title'), 'category_name']
//         ]
//       },
//       order,
//       limit,
//       offset,
//       distinct: true,
//     });
    
//     await log({
//       req,
//       action: R,
//       page_name: LIST,
//     });

//     res.status(200).json({
//       total: count,
//       data: rows,
//     });

//   } catch (error) {
//     console.error("Error fetching questions:", error);
//     res.status(500).json({ message: "Error fetching questions" });
//   }
// };

// export const getQuestionsByCategory = async (req, res) => {
//   try {
//     const { category_id } = req.params;

//     if (!category_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Category ID is required",
//       });
//     }

//     const questions = await ChatbotQuestion.findAll({
//       where: { category_id },
//       order: [["order", "ASC"]],
//     });

//     res.json({
//       success: true,
//       questions,
//     });
//   } catch (error) {
//     console.error("Error fetching questions by category:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching questions by category",
//       error: error.message,
//     });
//   }
// };

// // Get single question
// export const getQuestion = async (req, res) => {
//   try {
//     const question = await ChatbotQuestion.findByPk(req.params.id);

//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     res.json({
//       success: true,
//       question,
//     });
//   } catch (error) {
//     console.error("Error fetching question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching question",
//       error: error.message,
//     });
//   }
// };

// // Create new question
// export const createQuestion = async (req, res) => {
//   try {
//     const { en_question, od_question, category_id, status = "Active", order } = req.body;

//     if (!en_question || !od_question || !category_id) {
//       return res.status(400).json({
//         success: false,
//         message: "English, Odia, and category_id are required",
//       });
//     }

//     // ✅ FIXED: Check for duplicate question using both English and Odia questions
//     const existingQuestion = await ChatbotQuestion.findOne({
//       where: {
//         [Op.or]: [
//           { en_question: { [Op.eq]: en_question.trim() } },
//           { od_question: { [Op.eq]: od_question.trim() } }
//         ],
//         category_id: category_id
//       }
//     });
    
//     if (existingQuestion) {
//       // Provide a more specific error message to the user
//       if (existingQuestion.en_question === en_question.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Question with this English text already exists in this category'
//         });
//       }
//       if (existingQuestion.od_question === od_question.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Question with this Odia text already exists in this category'
//         });
//       }
//     }

//     // Find highest order for that category
//     const highestOrder = await ChatbotQuestion.findOne({
//       where: { category_id },
//       order: [["order", "DESC"]],
//     });

//     const newOrder = order ?? (highestOrder ? highestOrder.order + 1 : 0);

//     const question = await ChatbotQuestion.create({
//       en_question: en_question.trim(),
//       od_question: od_question.trim(),
//       category_id,
//       status,
//       order: newOrder,
//     });

//     await log({
//       req,
//       action: C,
//       page_name: ADD,
//       target: question.en_question
//     });

//     res.status(201).json({
//       success: true,
//       message: "Question created successfully",
//       question,
//     });
//   } catch (error) {
//     console.error("Error creating question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error creating question",
//       error: error.message,
//     });
//   }
// };

// // Update question
// export const updateQuestion = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const question = await ChatbotQuestion.findByPk(id);
    
//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     const { en_question, od_question, category_id, status, order } = req.body;
    
//     // ✅ FIXED: Robust duplicate check for both questions, excluding the current question
//     if (en_question || od_question) {
//       const duplicateQuery = {
//         where: {
//           [Op.or]: [],
//           id: { [Op.ne]: id }, // Exclude the current item
//           category_id: category_id !== undefined ? category_id : question.category_id
//         }
//       };

//       if (en_question) {
//         duplicateQuery.where[Op.or].push({ en_question: { [Op.eq]: en_question.trim() } });
//       }
//       if (od_question) {
//         duplicateQuery.where[Op.or].push({ od_question: { [Op.eq]: od_question.trim() } });
//       }

//       // Only run the check if there is a question to check
//       if (duplicateQuery.where[Op.or].length > 0) {
//         const existingDuplicate = await ChatbotQuestion.findOne(duplicateQuery);

//         if (existingDuplicate) {
//           if (en_question && existingDuplicate.en_question === en_question.trim()) {
//             return res.status(400).json({
//               success: false,
//               message: 'A question with this English text already exists in this category'
//             });
//           }
//           if (od_question && existingDuplicate.od_question === od_question.trim()) {
//             return res.status(400).json({
//               success: false,
//               message: 'A question with this Odia text already exists in this category'
//             });
//           }
//         }
//       }
//     }

//     // Update fields if they are provided in the request
//     if (en_question !== undefined) question.en_question = en_question.trim();
//     if (od_question !== undefined) question.od_question = od_question.trim();
//     if (category_id !== undefined) question.category_id = category_id;
//     if (status !== undefined) question.status = status;
//     if (order !== undefined) question.order = order;

//     await question.save();

//     await log({
//       req,
//       action: U,
//       page_name: EDIT,
//       target: question.en_question || id
//     });

//     res.json({
//       success: true,
//       message: "Question updated successfully",
//       question,
//     });
//   } catch (error) {
//     console.error("Error updating question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating question",
//       error: error.message,
//     });
//   }
// };

// // Delete question
// export const deleteQuestion = async (req, res) => {
//   try {
//     const question = await ChatbotQuestion.findByPk(req.params.id);

//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     await question.destroy();

//     res.json({
//       success: true,
//       message: "Question deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error deleting question",
//       error: error.message,
//     });
//   }
// };

// // Update order of multiple questions
// export const updateQuestionOrder = async (req, res) => {
//   try {
//     const { questions } = req.body;

//     if (!questions || !Array.isArray(questions)) {
//       return res.status(400).json({
//         success: false,
//         message: "Questions array is required",
//       });
//     }

//     for (let i = 0; i < questions.length; i++) {
//       const q = questions[i];
//       await ChatbotQuestion.update(
//         { order: i },
//         { where: { id: q.id } }
//       );
//     }

//     res.json({
//       success: true,
//       message: "Question order updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating question order:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating question order",
//       error: error.message,
//     });
//   }
// };



// import models from '../../models/index.js';
// import { Op } from 'sequelize';
// import sequelize from '../../../config/db.js';
// import { log } from "../../services/LogService.js";

// const [LIST, EDIT, ADD, C, R, U] = [
//   "CHATBOT QUESTION LIST",
//   "CHATBOT QUESTION EDIT",
//   "CHATBOT QUESTION ADD",
//   "CREATE",
//   "READ",
//   "UPDATE"
// ];

// const { ChatbotQuestion, ChatbotCategory } = models;

// export const getQuestions = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = req.query.search || "";
//     const sortBy = req.query.sort || "order";
//     const sortOrder = req.query.order || "ASC";

//     const allowedSortColumns = ["en_question", "od_question", "status", "category_name", "order", "createdAt"];
//     if (!allowedSortColumns.includes(sortBy)) {
//       return res.status(400).json({ message: "Invalid sort column" });
//     }

//     const offset = (page - 1) * limit;

//     const whereClause = {
//       ...(search && {
//         [Op.or]: [
//           { en_question: { [Op.like]: `%${search}%` } },
//           { od_question: { [Op.like]: `%${search}%` } },
//           { '$category.en_title$': { [Op.like]: `%${search}%` } },
//         ],
//       })
//     };

//     const order = sortBy === 'category_name'
//       ? [[{ model: ChatbotCategory, as: 'category' }, 'en_title', sortOrder.toUpperCase()]]
//       : [[sortBy, sortOrder.toUpperCase()]];

//     const { count, rows } = await ChatbotQuestion.findAndCountAll({
//       where: whereClause,
//       include: [{
//         model: ChatbotCategory,
//         as: 'category',
//         attributes: [],
//       }],
//       attributes: {
//         include: [
//           [sequelize.col('category.en_title'), 'category_name']
//         ]
//       },
//       order,
//       limit,
//       offset,
//       distinct: true,
//     });

//     await log({
//       req,
//       action: R,
//       page_name: LIST,
//     });

//     res.status(200).json({
//       total: count,
//       data: rows,
//     });

//   } catch (error) {
//     console.error("Error fetching questions:", error);
//     res.status(500).json({ message: "Error fetching questions" });
//   }
// };

// export const getQuestionsByCategory = async (req, res) => {
//   try {
//     const { category_id } = req.params;

//     if (!category_id) {
//       return res.status(400).json({
//         success: false,
//         message: "Category ID is required",
//       });
//     }

//     const questions = await ChatbotQuestion.findAll({
//       where: { category_id },
//       order: [["order", "ASC"]],
//     });

//     res.json({
//       success: true,
//       questions,
//     });
//   } catch (error) {
//     console.error("Error fetching questions by category:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching questions by category",
//       error: error.message,
//     });
//   }
// };

// export const getQuestion = async (req, res) => {
//   try {
//     const question = await ChatbotQuestion.findByPk(req.params.id);

//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     res.json({
//       success: true,
//       question,
//     });
//   } catch (error) {
//     console.error("Error fetching question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching question",
//       error: error.message,
//     });
//   }
// };

// // ✅ Create question with length validation
// export const createQuestion = async (req, res) => {
//   try {
//     const { en_question, od_question, category_id, status = "Active", order } = req.body;

//     if (!en_question || !od_question || !category_id) {
//       return res.status(400).json({
//         success: false,
//         message: "English, Odia, and category_id are required",
//       });
//     }

//     // ✅ Length Validation
//     if (en_question.trim().length > 255) {
//       return res.status(400).json({
//         success: false,
//         message: "English Question must be 255 characters or less",
//       });
//     }

//     if (od_question.trim().length > 255) {
//       return res.status(400).json({
//         success: false,
//         message: "Odia Question must be 255 characters or less",
//       });
//     }

//     const existingQuestion = await ChatbotQuestion.findOne({
//       where: {
//         [Op.or]: [
//           { en_question: { [Op.eq]: en_question.trim() } },
//           { od_question: { [Op.eq]: od_question.trim() } }
//         ],
//         category_id
//       }
//     });

//     if (existingQuestion) {
//       if (existingQuestion.en_question === en_question.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Question with this English text already exists in this category'
//         });
//       }
//       if (existingQuestion.od_question === od_question.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Question with this Odia text already exists in this category'
//         });
//       }
//     }

//     const highestOrder = await ChatbotQuestion.findOne({
//       where: { category_id },
//       order: [["order", "DESC"]],
//     });

//     const newOrder = order ?? (highestOrder ? highestOrder.order + 1 : 0);

//     const question = await ChatbotQuestion.create({
//       en_question: en_question.trim(),
//       od_question: od_question.trim(),
//       category_id,
//       status,
//       order: newOrder,
//     });

//     await log({
//       req,
//       action: C,
//       page_name: ADD,
//       target: question.en_question
//     });

//     res.status(201).json({
//       success: true,
//       message: "Question created successfully",
//       question,
//     });
//   } catch (error) {
//     console.error("Error creating question:", error);
    
//     // Handle unique constraint violation
//     if (error.name === 'SequelizeUniqueConstraintError') {
//       const field = error.errors[0]?.path;
//       if (field === 'unique_en_question_per_category') {
//         return res.status(400).json({
//           success: false,
//           message: 'A question with this English text already exists in this category'
//         });
//       } else if (field === 'unique_od_question_per_category') {
//         return res.status(400).json({
//           success: false,
//           message: 'A question with this Odia text already exists in this category'
//         });
//       }
//     }
    
//     res.status(500).json({
//       success: false,
//       message: "Error creating question",
//       error: error.message,
//     });
//   }
// };

// // ✅ Update question with length validation
// export const updateQuestion = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const question = await ChatbotQuestion.findByPk(id);

//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     const { en_question, od_question, category_id, status, order } = req.body;

//     // ✅ Length Validation
//     if (en_question && en_question.trim().length > 255) {
//       return res.status(400).json({
//         success: false,
//         message: "English Question must be 255 characters or less",
//       });
//     }

//     if (od_question && od_question.trim().length > 255) {
//       return res.status(400).json({
//         success: false,
//         message: "Odia Question must be 255 characters or less",
//       });
//     }

//     if (en_question || od_question) {
//       const duplicateQuery = {
//         where: {
//           [Op.or]: [],
//           id: { [Op.ne]: id },
//           category_id: category_id !== undefined ? category_id : question.category_id
//         }
//       };

//       if (en_question) {
//         duplicateQuery.where[Op.or].push({ en_question: { [Op.eq]: en_question.trim() } });
//       }
//       if (od_question) {
//         duplicateQuery.where[Op.or].push({ od_question: { [Op.eq]: od_question.trim() } });
//       }

//       if (duplicateQuery.where[Op.or].length > 0) {
//         const existingDuplicate = await ChatbotQuestion.findOne(duplicateQuery);

//         if (existingDuplicate) {
//           if (en_question && existingDuplicate.en_question === en_question.trim()) {
//             return res.status(400).json({
//               success: false,
//               message: 'A question with this English text already exists in this category'
//             });
//           }
//           if (od_question && existingDuplicate.od_question === od_question.trim()) {
//             return res.status(400).json({
//               success: false,
//               message: 'A question with this Odia text already exists in this category'
//             });
//           }
//         }
//       }
//     }

//     if (en_question !== undefined) question.en_question = en_question.trim();
//     if (od_question !== undefined) question.od_question = od_question.trim();
//     if (category_id !== undefined) question.category_id = category_id;
//     if (status !== undefined) question.status = status;
//     if (order !== undefined) question.order = order;

//     await question.save();

//     await log({
//       req,
//       action: U,
//       page_name: EDIT,
//       target: question.en_question || id
//     });

//     res.json({
//       success: true,
//       message: "Question updated successfully",
//       question,
//     });
//   } catch (error) {
//     console.error("Error updating question:", error);
    
//     // Handle unique constraint violation
//     if (error.name === 'SequelizeUniqueConstraintError') {
//       const field = error.errors[0]?.path;
//       if (field === 'unique_en_question_per_category') {
//         return res.status(400).json({
//           success: false,
//           message: 'A question with this English text already exists in this category'
//         });
//       } else if (field === 'unique_od_question_per_category') {
//         return res.status(400).json({
//           success: false,
//           message: 'A question with this Odia text already exists in this category'
//         });
//       }
//     }
    
//     res.status(500).json({
//       success: false,
//       message: "Error updating question",
//       error: error.message,
//     });
//   }
// };

// export const deleteQuestion = async (req, res) => {
//   try {
//     const question = await ChatbotQuestion.findByPk(req.params.id);

//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     await question.destroy();

//     res.json({
//       success: true,
//       message: "Question deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting question:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error deleting question",
//       error: error.message,
//     });
//   }
// };

// export const updateQuestionOrder = async (req, res) => {
//   try {
//     const { questions } = req.body;

//     if (!questions || !Array.isArray(questions)) {
//       return res.status(400).json({
//         success: false,
//         message: "Questions array is required",
//       });
//     }

//     for (let i = 0; i < questions.length; i++) {
//       const q = questions[i];
//       await ChatbotQuestion.update(
//         { order: i },
//         { where: { id: q.id } }
//       );
//     }

//     res.json({
//       success: true,
//       message: "Question order updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating question order:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error updating question order",
//       error: error.message,
//     });
//   }
// };



import models from '../../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../../../config/db.js';
import { log } from "../../services/LogService.js";

const [LIST, EDIT, ADD, C, R, U] = [
  "CHATBOT QUESTION LIST",
  "CHATBOT QUESTION EDIT",
  "CHATBOT QUESTION ADD",
  "CREATE",
  "READ",
  "UPDATE"
];

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
          { '$category.en_title$': { [Op.like]: `%${search}%` } },
        ],
      })
    };

    const order = sortBy === 'category_name'
      ? [[{ model: ChatbotCategory, as: 'category' }, 'en_title', sortOrder.toUpperCase()]]
      : [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await ChatbotQuestion.findAndCountAll({
      where: whereClause,
      include: [{
        model: ChatbotCategory,
        as: 'category',
        attributes: [],
      }],
      attributes: {
        include: [
          [sequelize.col('category.en_title'), 'category_name']
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
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Error fetching questions" });
  }
};

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

// ✅ Create question with length validation and global uniqueness
export const createQuestion = async (req, res) => {
  try {
    const { en_question, od_question, category_id, status = "Active", order } = req.body;

    if (!en_question || !od_question || !category_id) {
      return res.status(400).json({
        success: false,
        message: "English, Odia, and category_id are required",
      });
    }

    // ✅ Length Validation
    if (en_question.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: "English Question must be 255 characters or less",
      });
    }

    if (od_question.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: "Odia Question must be 255 characters or less",
      });
    }

    // ✅ Check for global uniqueness (across all categories)
    const existingEnglishQuestion = await ChatbotQuestion.findOne({
      where: { en_question: { [Op.eq]: en_question.trim() } }
    });

    if (existingEnglishQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Question with this English text already exists'
      });
    }

    const existingOdiaQuestion = await ChatbotQuestion.findOne({
      where: { od_question: { [Op.eq]: od_question.trim() } }
    });

    if (existingOdiaQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Question with this Odia text already exists'
      });
    }

    const highestOrder = await ChatbotQuestion.findOne({
      where: { category_id },
      order: [["order", "DESC"]],
    });

    const newOrder = order ?? (highestOrder ? highestOrder.order + 1 : 0);

    const question = await ChatbotQuestion.create({
      en_question: en_question.trim(),
      od_question: od_question.trim(),
      category_id,
      status,
      order: newOrder,
    });

    await log({
      req,
      action: C,
      page_name: ADD,
      target: question.en_question
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    
    // Handle unique constraint violation
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      if (field === 'unique_en_question') {
        return res.status(400).json({
          success: false,
          message: 'A question with this English text already exists'
        });
      } else if (field === 'unique_od_question') {
        return res.status(400).json({
          success: false,
          message: 'A question with this Odia text already exists'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating question",
      error: error.message,
    });
  }
};

// ✅ Update question with length validation and global uniqueness
export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await ChatbotQuestion.findByPk(id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    const { en_question, od_question, category_id, status, order } = req.body;

    // ✅ Length Validation
    if (en_question && en_question.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: "English Question must be 255 characters or less",
      });
    }

    if (od_question && od_question.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: "Odia Question must be 255 characters or less",
      });
    }

    // ✅ Check for global uniqueness (across all categories)
    if (en_question) {
      const existingEnglishQuestion = await ChatbotQuestion.findOne({
        where: { 
          en_question: { [Op.eq]: en_question.trim() },
          id: { [Op.ne]: id }
        }
      });

      if (existingEnglishQuestion) {
        return res.status(400).json({
          success: false,
          message: 'A question with this English text already exists'
        });
      }
    }

    if (od_question) {
      const existingOdiaQuestion = await ChatbotQuestion.findOne({
        where: { 
          od_question: { [Op.eq]: od_question.trim() },
          id: { [Op.ne]: id }
        }
      });

      if (existingOdiaQuestion) {
        return res.status(400).json({
          success: false,
          message: 'A question with this Odia text already exists'
        });
      }
    }

    if (en_question !== undefined) question.en_question = en_question.trim();
    if (od_question !== undefined) question.od_question = od_question.trim();
    if (category_id !== undefined) question.category_id = category_id;
    if (status !== undefined) question.status = status;
    if (order !== undefined) question.order = order;

    await question.save();

    await log({
      req,
      action: U,
      page_name: EDIT,
      target: question.en_question || id
    });

    res.json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    
    // Handle unique constraint violation
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      if (field === 'unique_en_question') {
        return res.status(400).json({
          success: false,
          message: 'A question with this English text already exists'
        });
      } else if (field === 'unique_od_question') {
        return res.status(400).json({
          success: false,
          message: 'A question with this Odia text already exists'
        });
      }
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating question",
      error: error.message,
    });
  }
};

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