// import models from '../../models/index.js';
// import { Op } from 'sequelize';
// import { log } from '../../services/LogService.js';

// const [LIST, EDIT, ADD, C, R, U] = [
//   "CHATBOT CATEGORY LIST",
//   "CHATBOT CATEGORY EDIT",
//   "CHATBOT CATEGORY ADD",
//   "CREATE",
//   "READ",
//   "UPDATE"
// ];

// const {ChatbotCategory} = models

// // Get all categories with pagination and search
// export const getCategories = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = req.query.search || "";
//     const sortBy = req.query.sort || "order"; 
//     const sortOrder = req.query.order || "ASC";

//     const allowedSortColumns = ["en_title", "od_title", "status", "order", "createdAt"];
//     if (!allowedSortColumns.includes(sortBy)) {
//       return res.status(400).json({ message: "Invalid sort column" });
//     }

//     const offset = (page - 1) * limit;

//     const whereClause = {
//       ...(search && {
//         [Op.or]: [
//           { en_title: { [Op.like]: `%${search}%` } },
//           { od_title: { [Op.like]: `%${search}%` } }
//         ]
//       })
//     };

//     const { count, rows } = await ChatbotCategory.findAndCountAll({
//       where: whereClause,
//       limit,
//       offset,
//       order: [[sortBy, sortOrder.toUpperCase()]]
//     });

    
//        await log({
//               req,
//               action: R,
//               page_name: LIST,
              
//             });

//     // Return data in the standard format { total, data }
//     res.status(200).json({
//       total: count,
//       data: rows
//     });

//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     res.status(500).json({ message: 'Error fetching categories' });
//   }
// };


// // Get single category
// export const getCategory = async (req, res) => {
//   try {
//     const category = await ChatbotCategory.findByPk(req.params.id);
    
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found'
//       });
//     }

//     res.json({
//       success: true,
//       category
//     });
//   } catch (error) {
//     console.error('Error fetching category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching category',
//       error: error.message
//     });
//   }
// };

// // Create new category
// export const createCategory = async (req, res) => {
//   try {
//     const { en_title, od_title, status = 'Active', image = '' } = req.body;

//     if (!en_title || !od_title) {
//       return res.status(400).json({
//         success: false,
//         message: 'Both English and Odia names are required'
//       });
//     }
   
//     // Check for duplicate category
//     const existingCategory = await ChatbotCategory.findOne({
//       where: {en_title: {[Op.eq]: en_title}}
//     });
    
//     if(existingCategory){
//       return res.status(400).json({
//         success: false,
//         message: 'Category with this English name already exists'
//       });
//     }

//     const highestOrderCategory = await ChatbotCategory.findOne({
//       order: [['order', 'DESC']]
//     });
    
//     const order = highestOrderCategory ? highestOrderCategory.order + 1 : 0;

//     const category = await ChatbotCategory.create({
//       en_title,
//       od_title,
//       status,
//       image,
//       order
//     });

    
//        await log({
//               req,
//               action: C,
//               page_name: ADD,
//               target: category.en_title 
//             });

//     res.status(201).json({
//       success: true,
//       message: 'Category created successfully',
//       category
//     });
//   } catch (error) {
//     console.error('Error creating category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating category',
//       error: error.message
//     });
//   }
// };

// // Update category
// export const updateCategory = async (req, res) => {
//   try {
//     const category = await ChatbotCategory.findByPk(req.params.id);
    
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found'
//       });
//     }

//     const { en_title, od_title, status, image } = req.body;
    
//     if (en_title && en_title !== category.en_title) {
//       // ✅ FIXED: Changed Op.iLike to Op.like for MySQL compatibility
//       const existingCategory = await ChatbotCategory.findOne({
//         where: { 
//           en_title: { [Op.like]: en_title }, // Changed from Op.iLike to Op.like
//           id: { [Op.ne]: req.params.id }
//         }
//       });

//       if (existingCategory) {
//         return res.status(400).json({
//           success: false,
//           message: 'A category with this English name already exists'
//         });
//       }
//     }

//     if (en_title !== undefined) category.en_title = en_title;
//     if (od_title !== undefined) category.od_title = od_title;
//     if (status !== undefined) category.status = status;
//     if (image !== undefined) category.image = image;

//     await category.save();

    
//        await log({
//               req,
//               action: U,
//               page_name: EDIT,
//               target: category.en_title || req.params.id
//             });

//     res.json({
//       success: true,
//       message: 'Category updated successfully',
//       category
//     });
//   } catch (error) {
//     console.error('Error updating category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating category',
//       error: error.message
//     });
//   }
// };

// // Delete category
// export const deleteCategory = async (req, res) => {
//   try {
//     const category = await ChatbotCategory.findByPk(req.params.id);
    
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found'
//       });
//     }

//     await category.destroy();

//     res.json({
//       success: true,
//       message: 'Category deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting category',
//       error: error.message
//     });
//   }
// };

// // Update category order
// export const updateCategoryOrder = async (req, res) => {
//   try {
//     const { categories } = req.body;

//     if (!categories || !Array.isArray(categories)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Categories array is required'
//       });
//     }

//     for (let i = 0; i < categories.length; i++) {
//       const category = categories[i];
//       await ChatbotCategory.update(
//         { order: i },
//         { where: { id: category.id } }
//       );
//     }

//     res.json({
//       success: true,
//       message: 'Category order updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating category order:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating category order',
//       error: error.message
//     });
//   }
// };

// import models from '../../models/index.js';
// import { Op } from 'sequelize';
// import { log } from '../../services/LogService.js';

// const [LIST, EDIT, ADD, C, R, U] = [
//   "CHATBOT CATEGORY LIST",
//   "CHATBOT CATEGORY EDIT",
//   "CHATBOT CATEGORY ADD",
//   "CREATE",
//   "READ",
//   "UPDATE"
// ];

// const { ChatbotCategory } = models;

// // Get all categories with pagination and search
// export const getCategories = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const search = req.query.search || "";
//     const sortBy = req.query.sort || "order"; 
//     const sortOrder = req.query.order || "ASC";

//     const allowedSortColumns = ["en_title", "od_title", "status", "order", "createdAt"];
//     if (!allowedSortColumns.includes(sortBy)) {
//       return res.status(400).json({ message: "Invalid sort column" });
//     }

//     const offset = (page - 1) * limit;

//     const whereClause = {
//       ...(search && {
//         [Op.or]: [
//           { en_title: { [Op.like]: `%${search}%` } },
//           { od_title: { [Op.like]: `%${search}%` } }
//         ]
//       })
//     };

//     const { count, rows } = await ChatbotCategory.findAndCountAll({
//       where: whereClause,
//       limit,
//       offset,
//       order: [[sortBy, sortOrder.toUpperCase()]]
//     });
    
//     await log({
//       req,
//       action: R,
//       page_name: LIST,
//     });

//     res.status(200).json({
//       total: count,
//       data: rows
//     });

//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     res.status(500).json({ message: 'Error fetching categories' });
//   }
// };

// // Get single category
// export const getCategory = async (req, res) => {
//   try {
//     const category = await ChatbotCategory.findByPk(req.params.id);
    
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found'
//       });
//     }

//     res.json({
//       success: true,
//       category
//     });
//   } catch (error) {
//     console.error('Error fetching category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching category',
//       error: error.message
//     });
//   }
// };

// // Create new category
// export const createCategory = async (req, res) => {
//   try {
//     const { en_title, od_title, status = 'Active', image = '' } = req.body;
  
//     if (!en_title || !od_title) {
//       return res.status(400).json({
//         success: false,
//         message: 'Both English and Odia names are required'
//       });
//     }
   
//     // ✅ FIXED: Check for duplicate category using both English and Odia titles
//     const existingCategory = await ChatbotCategory.findOne({
//       where: {
//         [Op.or]: [
//           { en_title: { [Op.eq]: en_title.trim() } },
//           { od_title: { [Op.eq]: od_title.trim() } }
//         ]
//       }
//     });
    
//     if (existingCategory) {
//       // Provide a more specific error message to the user
//       if (existingCategory.en_title === en_title.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Category with this English name already exists'
//         });
//       }
//       if (existingCategory.od_title === od_title.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Category with this Odia name already exists'
//         });
//       }
//     }

//     const highestOrderCategory = await ChatbotCategory.findOne({
//       order: [['order', 'DESC']]
//     });
    
//     const order = highestOrderCategory ? highestOrderCategory.order + 1 : 0;

//     const category = await ChatbotCategory.create({
//       en_title: en_title.trim(),
//       od_title: od_title.trim(),
//       status,
//       image,
//       order
//     });
    
//     await log({
//       req,
//       action: C,
//       page_name: ADD,
//       target: category.en_title 
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Category created successfully',
//       category
//     });
//   } catch (error) {
//     console.error('Error creating category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating category',
//       error: error.message
//     });
//   }
// };

// // Update category
// export const updateCategory = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const category = await ChatbotCategory.findByPk(id);
    
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found'
//       });
//     }

//     const { en_title, od_title, status, image } = req.body;
    
//     // ✅ FIXED: Robust duplicate check for both titles, excluding the current category
//     if (en_title || od_title) {
//       const duplicateQuery = {
//         where: {
//           [Op.or]: [],
//           id: { [Op.ne]: id } // Most important part: Exclude the current item
//         }
//       };

//       if (en_title) {
//         duplicateQuery.where[Op.or].push({ en_title: { [Op.eq]: en_title.trim() } });
//       }
//       if (od_title) {
//         duplicateQuery.where[Op.or].push({ od_title: { [Op.eq]: od_title.trim() } });
//       }

//       // Only run the check if there is a title to check
//       if (duplicateQuery.where[Op.or].length > 0) {
//         const existingDuplicate = await ChatbotCategory.findOne(duplicateQuery);

//         if (existingDuplicate) {
//           if (en_title && existingDuplicate.en_title === en_title.trim()) {
//             return res.status(400).json({
//               success: false,
//               message: 'A category with this English name already exists'
//             });
//           }
//           if (od_title && existingDuplicate.od_title === od_title.trim()) {
//             return res.status(400).json({
//               success: false,
//               message: 'A category with this Odia name already exists'
//             });
//           }
//         }
//       }
//     }

//     // Update fields if they are provided in the request
//     if (en_title !== undefined) category.en_title = en_title.trim();
//     if (od_title !== undefined) category.od_title = od_title.trim();
//     if (status !== undefined) category.status = status;
//     if (image !== undefined) category.image = image;

//     await category.save();
    
//     await log({
//       req,
//       action: U,
//       page_name: EDIT,
//       target: category.en_title || id
//     });

//     res.json({
//       success: true,
//       message: 'Category updated successfully',
//       category
//     });
//   } catch (error) {
//     console.error('Error updating category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating category',
//       error: error.message
//     });
//   }
// };

// // Delete category
// export const deleteCategory = async (req, res) => {
//   try {
//     const category = await ChatbotCategory.findByPk(req.params.id);
    
//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: 'Category not found'
//       });
//     }

//     await category.destroy();

//     res.json({
//       success: true,
//       message: 'Category deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting category:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting category',
//       error: error.message
//     });
//   }
// };

// // Update category order
// export const updateCategoryOrder = async (req, res) => {
//   try {
//     const { categories } = req.body;

//     if (!categories || !Array.isArray(categories)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Categories array is required'
//       });
//     }

//     for (let i = 0; i < categories.length; i++) {
//       const category = categories[i];
//       await ChatbotCategory.update(
//         { order: i },
//         { where: { id: category.id } }
//       );
//     }

//     res.json({
//       success: true,
//       message: 'Category order updated successfully'
//     });
//   } catch (error) {
//     console.error('Error updating category order:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error updating category order',
//       error: error.message
//     });
//   }
// };
import models from '../../models/index.js';
import { Op } from 'sequelize';
import { log } from '../../services/LogService.js';

const [LIST, EDIT, ADD, C, R, U] = [
  "CHATBOT CATEGORY LIST",
  "CHATBOT CATEGORY EDIT",
  "CHATBOT CATEGORY ADD",
  "CREATE",
  "READ",
  "UPDATE"
];

const { ChatbotCategory } = models;

// Obtener todas las categorías con paginación y búsqueda
export const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "order";
    const sortOrder = req.query.order || "ASC";

    const allowedSortColumns = ["en_title", "od_title", "status", "order", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } }
        ]
      })
    };

    const { count, rows } = await ChatbotCategory.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]]
    });
    
    await log({
      req,
      action: R,
      page_name: LIST,
    });

    res.status(200).json({
      total: count,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Obtener una sola categoría
export const getCategory = async (req, res) => {
  try {
    const category = await ChatbotCategory.findByPk(req.params.id);
    
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
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// Crear nueva categoría
export const createCategory = async (req, res) => {
  try {
    const { en_title, od_title, status = 'Active', image = '' } = req.body;
  
    if (!en_title || !od_title) {
      return res.status(400).json({
        success: false,
        message: 'Both English and Odia names are required'
      });
    }
    
    const trimmedEnTitle = en_title.trim();
    const trimmedOdTitle = od_title.trim();

    // ✅ ACTUALIZADO: Validación del límite de caracteres (máx. 100 caracteres)
    if (trimmedEnTitle.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'English name must be 100 characters or less'
      });
    }

    if (trimmedOdTitle.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Odia name must be 100 characters or less'
      });
    }
   
    // ✅ CORREGIDO: Comprobar si hay una categoría duplicada usando tanto el título en inglés como en odia
    const existingCategory = await ChatbotCategory.findOne({
      where: {
        [Op.or]: [
          { en_title: { [Op.eq]: trimmedEnTitle } },
          { od_title: { [Op.eq]: trimmedOdTitle } }
        ]
      }
    });
    
    if (existingCategory) {
      // Proporcionar un mensaje de error más específico al usuario
      if (existingCategory.en_title === trimmedEnTitle) {
        return res.status(400).json({
          success: false,
          message: 'A category with this English name already exists'
        });
      }
      if (existingCategory.od_title === trimmedOdTitle) {
        return res.status(400).json({
          success: false,
          message: 'A category with this Odia name already exists'
        });
      }
    }

    const highestOrderCategory = await ChatbotCategory.findOne({
      order: [['order', 'DESC']]
    });
    
    const order = highestOrderCategory ? highestOrderCategory.order + 1 : 1;

    const category = await ChatbotCategory.create({
      en_title: trimmedEnTitle,
      od_title: trimmedOdTitle,
      status,
      image,
      order
    });
    
    await log({
      req,
      action: C,
      page_name: ADD,
      target: category.en_title
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// Actualizar categoría
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await ChatbotCategory.findByPk(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const { en_title, od_title, status, image } = req.body;

    const trimmedEnTitle = en_title?.trim();
    const trimmedOdTitle = od_title?.trim();

    // ✅ ACTUALIZADO: Validación del límite de caracteres (máx. 100 caracteres)
    if (trimmedEnTitle !== undefined && trimmedEnTitle.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'English name must be 100 characters or less'
      });
    }

    if (trimmedOdTitle !== undefined && trimmedOdTitle.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Odia name must be 100 characters or less'
      });
    }
    
    // ✅ CORREGIDO: Comprobación robusta de duplicados para ambos títulos, excluyendo la categoría actual
    if (trimmedEnTitle || trimmedOdTitle) {
      const duplicateQueryConditions = [];
      if (trimmedEnTitle) {
        duplicateQueryConditions.push({ en_title: { [Op.eq]: trimmedEnTitle } });
      }
      if (trimmedOdTitle) {
        duplicateQueryConditions.push({ od_title: { [Op.eq]: trimmedOdTitle } });
      }

      if (duplicateQueryConditions.length > 0) {
        const existingDuplicate = await ChatbotCategory.findOne({
          where: {
            [Op.or]: duplicateQueryConditions,
            id: { [Op.ne]: id } // Parte más importante: Excluir el elemento actual
          }
        });

        if (existingDuplicate) {
          if (trimmedEnTitle && existingDuplicate.en_title === trimmedEnTitle) {
            return res.status(400).json({
              success: false,
              message: 'A category with this English name already exists'
            });
          }
          if (trimmedOdTitle && existingDuplicate.od_title === trimmedOdTitle) {
            return res.status(400).json({
              success: false,
              message: 'A category with this Odia name already exists'
            });
          }
        }
      }
    }

    // Actualizar campos si se proporcionan en la solicitud
    if (trimmedEnTitle !== undefined) category.en_title = trimmedEnTitle;
    if (trimmedOdTitle !== undefined) category.od_title = trimmedOdTitle;
    if (status !== undefined) category.status = status;
    if (image !== undefined) category.image = image;

    await category.save();
    
    await log({
      req,
      action: U,
      page_name: EDIT,
      target: category.en_title || id
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    // Manejar errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// Eliminar categoría
export const deleteCategory = async (req, res) => {
  try {
    const category = await ChatbotCategory.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// Actualizar el orden de las categorías
export const updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required'
      });
    }

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      await ChatbotCategory.update(
        { order: i + 1 }, // El orden suele empezar en 1, no en 0
        { where: { id: category.id } }
      );
    }

    res.json({
      success: true,
      message: 'Category order updated successfully'
    });
  } catch (error) {
    console.error('Error updating category order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category order',
      error: error.message
    });
  }
};