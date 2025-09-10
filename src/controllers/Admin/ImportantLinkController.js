// import ImportantLink from '../models/ImportantLink.js';
// import { Op } from 'sequelize';
// import path from 'path';

// // Get all important links with pagination and search
// export const getAllLinks = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || '';
//     const offset = (page - 1) * limit;

//     let whereCondition = {};
//     if (search) {
//       whereCondition = {
//         [Op.or]: [
//           { title: { [Op.like]: `%${search}%` } },
//           { url: { [Op.like]: `%${search}%` } }
//         ]
//       };
//     }

//     const { count, rows } = await ImportantLink.findAndCountAll({
//       where: whereCondition,
//       limit,
//       offset,
//       order: [['created_at', 'DESC']]
//     });

//     const totalPages = Math.ceil(count / limit);

//     // transform rows to plain objects and add imageUrl
//     const transformed = rows.map(r => {
//       const obj = r.toJSON();
//       obj.imageUrl = obj.image ? `/uploads/important-links/${obj.image}` : null;
//       return obj;
//     });

//     res.json({
//       success: true,
//       links: transformed,
//       totalLinks: count,
//       totalPages,
//       currentPage: page
//     });
//   } catch (error) {
//     console.error('Error fetching links:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch links',
//       error: error.message
//     });
//   }
// };

// // Get single link by ID
// export const getLink = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const link = await ImportantLink.findByPk(id);

//     if (!link) {
//       return res.status(404).json({
//         success: false,
//         message: 'Link not found'
//       });
//     }

//     const obj = link.toJSON();
//     obj.imageUrl = obj.image ? `/uploads/important-links/${obj.image}` : null;

//     res.json({
//       success: true,
//       link: obj
//     });
//   } catch (error) {
//     console.error('Error fetching link:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch link',
//       error: error.message
//     });
//   }
// };

// // Create new link
// export const createLink = async (req, res) => {
//   try {
//     const { title, url } = req.body;
    
//     // Basic URL format check (accepts any string that could be a URL)
//     if (!url || typeof url !== 'string' || url.trim().length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a valid URL'
//       });
//     }

//     // Check for duplicate URL
//     const existingLink = await ImportantLink.findOne({
//       where: { url: url.trim() }
//     });

//     if (existingLink) {
//       return res.status(409).json({
//         success: false,
//         message: 'A link with this URL already exists'
//       });
//     }

//     // store only filename (middleware gives req.file.path)
//     const filename = req.file ? path.basename(req.file.path) : null;

//     const newLink = await ImportantLink.create({
//       title,
//       url: url.trim(),
//       image: filename
//     });

//     const obj = newLink.toJSON();
//     obj.imageUrl = filename ? `/uploads/important-links/${filename}` : null;

//     res.status(201).json({
//       success: true,
//       message: 'Link created successfully',
//       link: obj
//     });
//   } catch (error) {
//     console.error('Error creating link:', error);
    
//     // Handle Sequelize validation errors
//     if (error.name === 'SequelizeValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         error: error.errors.map(e => e.message)
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create link',
//       error: error.message
//     });
//   }
// };

// // Update link
// export const updateLink = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, url } = req.body;
    
//     const link = await ImportantLink.findByPk(id);
    
//     if (!link) {
//       return res.status(404).json({
//         success: false,
//         message: 'Link not found'
//       });
//     }

//     // Basic URL format check (accepts any string that could be a URL)
//     if (!url || typeof url !== 'string' || url.trim().length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a valid URL'
//       });
//     }

//     // Check for duplicate URL (excluding current link)
//     const existingLink = await ImportantLink.findOne({
//       where: {
//         url: url.trim(),
//         id: { [Op.ne]: id } // ne = not equal
//       }
//     });

//     if (existingLink) {
//       return res.status(409).json({
//         success: false,
//         message: 'A link with this URL already exists'
//       });
//     }

//     // If new image is uploaded, store only filename; otherwise keep the existing one
//     const filename = req.file ? path.basename(req.file.path) : link.image;

//     await link.update({
//       title,
//       url: url.trim(),
//       image: filename
//     });

//     const obj = link.toJSON();
//     obj.imageUrl = filename ? `/uploads/important-links/${filename}` : null;

//     res.json({
//       success: true,
//       message: 'Link updated successfully',
//       link: obj
//     });
//   } catch (error) {
//     console.error('Error updating link:', error);
    
//     // Handle Sequelize validation errors
//     if (error.name === 'SequelizeValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         error: error.errors.map(e => e.message)
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update link',
//       error: error.message
//     });
//   }
// };

// // Delete link
// export const deleteLink = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const link = await ImportantLink.findByPk(id);
    
//     if (!link) {
//       return res.status(404).json({
//         success: false,
//         message: 'Link not found'
//       });
//     }

//     await link.destroy();

//     res.json({
//       success: true,
//       message: 'Link deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting link:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete link',
//       error: error.message
//     });
//   }
// };

// // Update link status
// export const updateStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
    
//     const link = await ImportantLink.findByPk(id);
    
//     if (!link) {
//       return res.status(404).json({
//         success: false,
//         message: 'Link not found'
//       });
//     }

//     await link.update({
//       is_active: status
//     });

//     const obj = link.toJSON();
//     obj.imageUrl = obj.image ? `/uploads/important-links/${obj.image}` : null;

//     res.json({
//       success: true,
//       message: 'Link status updated successfully',
//       link: obj
//     });
//   } catch (error) {
//     console.error('Error updating link status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update link status',
//       error: error.message
//     });
//   }
// };



// import ImportantLink from '../models/ImportantLink.js';
// import { Op } from 'sequelize';
// import path from 'path';
// import fs from 'fs';

// // Get all important links with pagination and search
// export const getAllLinks = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const search = req.query.search || '';
//     const offset = (page - 1) * limit;

//     let whereCondition = {};
//     if (search) {
//       whereCondition = {
//         [Op.or]: [
//           { title: { [Op.like]: `%${search}%` } },
//           { url: { [Op.like]: `%${search}%` } }
//         ]
//       };
//     }

//     const { count, rows } = await ImportantLink.findAndCountAll({
//       where: whereCondition,
//       limit,
//       offset,
//       order: [['created_at', 'DESC']]
//     });

//     const totalPages = Math.ceil(count / limit);

//     // transform rows to plain objects and add imageUrl
//     const transformed = rows.map(r => {
//       const obj = r.toJSON();
//       obj.imageUrl = obj.image ? `/uploads/important-links/${obj.image}` : null;
//       return obj;
//     });

//     res.json({
//       success: true,
//       links: transformed,
//       totalLinks: count,
//       totalPages,
//       currentPage: page
//     });
//   } catch (error) {
//     console.error('Error fetching links:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch links',
//       error: error.message
//     });
//   }
// };

// // Get single link by ID
// export const getLink = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const link = await ImportantLink.findByPk(id);

//     if (!link) {
//       return res.status(404).json({
//         success: false,
//         message: 'Link not found'
//       });
//     }

//     const obj = link.toJSON();
//     obj.imageUrl = obj.image ? `/uploads/important-links/${obj.image}` : null;

//     res.json({
//       success: true,
//       link: obj
//     });
//   } catch (error) {
//     console.error('Error fetching link:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch link',
//       error: error.message
//     });
//   }
// };

// // Create new link
// export const createLink = async (req, res) => {
//   try {
//     const { title, url } = req.body;
    
//     // Basic URL format check (accepts any string that could be a URL)
//     if (!url || typeof url !== 'string' || url.trim().length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a valid URL'
//       });
//     }

//     // Check for duplicate URL
//     const existingLink = await ImportantLink.findOne({
//       where: { url: url.trim() }
//     });

//     if (existingLink) {
//       return res.status(409).json({
//         success: false,
//         message: 'A link with this URL already exists'
//       });
//     }

//     // store only filename (middleware gives req.file.path)
//     const filename = req.file ? path.basename(req.file.path) : null;

//     const newLink = await ImportantLink.create({
//       title,
//       url: url.trim(),
//       image: filename
//     });

//     const obj = newLink.toJSON();
//     obj.imageUrl = filename ? `/uploads/important-links/${filename}` : null;

//     res.status(201).json({
//       success: true,
//       message: 'Link created successfully',
//       link: obj
//     });
//   } catch (error) {
//     console.error('Error creating link:', error);
    
//     // Handle Sequelize validation errors
//     if (error.name === 'SequelizeValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         error: error.errors.map(e => e.message)
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to create link',
//       error: error.message
//     });
//   }
// };

// // Update link
// export const updateLink = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, url, shouldDeleteImage } = req.body;
    
//     const link = await ImportantLink.findByPk(id);
    
//     if (!link) {
//       return res.status(404).json({
//         success: false,
//         message: 'Link not found'
//       });
//     }

//     // Basic URL format check (accepts any string that could be a URL)
//     if (!url || typeof url !== 'string' || url.trim().length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Please provide a valid URL'
//       });
//     }

//     // Check for duplicate URL (excluding current link)
//     const existingLink = await ImportantLink.findOne({
//       where: {
//         url: url.trim(),
//         id: { [Op.ne]: id } // ne = not equal
//       }
//     });

//     if (existingLink) {
//       return res.status(409).json({
//         success: false,
//         message: 'A link with this URL already exists'
//       });
//     }

//     let filename = link.image;
    
//     // If shouldDeleteImage flag is set, delete the existing image
//     if (shouldDeleteImage === 'true' && link.image) {
//       // Delete the image file from server
//       const imagePath = path.join('uploads', 'important-links', link.image);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//       filename = null;
//     }
    
//     // If new image is uploaded, store only filename
//     if (req.file) {
//       // Delete the old image if it exists
//       if (link.image) {
//         const oldImagePath = path.join('uploads', 'important-links', link.image);
//         if (fs.existsSync(oldImagePath)) {
//           fs.unlinkSync(oldImagePath);
//         }
//       }
//       filename = path.basename(req.file.path);
//     }

//     await link.update({
//       title,
//       url: url.trim(),
//       image: filename
//     });

//     const obj = link.toJSON();
//     obj.imageUrl = filename ? `/uploads/important-links/${filename}` : null;

//     res.json({
//       success: true,
//       message: 'Link updated successfully',
//       link: obj
//     });
//   } catch (error) {
//     console.error('Error updating link:', error);
    
//     // Handle Sequelize validation errors
//     if (error.name === 'SequelizeValidationError') {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation error',
//         error: error.errors.map(e => e.message)
//       });
//     }
    
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update link',
//       error: error.message
//     });
//   }
// };

// // Delete link
// export const deleteLink = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const link = await ImportantLink.findByPk(id);
    
//     if (!link) {
//       return res.status(404).json({
//         success: false,
//         message: 'Link not found'
//       });
//     }

//     // Delete the image file if it exists
//     if (link.image) {
//       const imagePath = path.join('uploads', 'important-links', link.image);
//       if (fs.existsSync(imagePath)) {
//         fs.unlinkSync(imagePath);
//       }
//     }

//     await link.destroy();

//     res.json({
//       success: true,
//       message: 'Link deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting link:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to delete link',
//       error: error.message
//     });
//   }
// };

// // Update link status
// export const updateStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
    
//     const link = await ImportantLink.findByPk(id);
    
//     if (!link) {
//       return res.status(404).json({
//         success: false,
//         message: 'Link not found'
//       });
//     }

//     await link.update({
//       is_active: status
//     });

//     const obj = link.toJSON();
//     obj.imageUrl = obj.image ? `/uploads/important-links/${obj.image}` : null;

//     res.json({
//       success: true,
//       message: 'Link status updated successfully',
//       link: obj
//     });
//   } catch (error) {
//     console.error('Error updating link status:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to update link status',
//       error: error.message
//     });
//   }
// };   



import path from 'path';
import fs from 'fs';
import ImportantLink from '../../models/ImportantLink.js';
import { Op } from 'sequelize';
// Create/Register a new Important Link (with optional image upload)
export const registerImportantLink = async (req, res) => {
  try {
    const { url } = req.body;

    let image = null;
    if (req.file && req.file.path) {
      // Save only the filename for DB (assuming req.file.path includes the filename)
      image = path.basename(req.file.path);
    }

    const importantLink = await ImportantLink.create({
      url,
      image,
    });

    return res.status(201).json({
      success: true,
      message: 'Important link registered successfully',
      importantLink,
    });
  } catch (error) {
    console.error('Register Important Link Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all important links with optional pagination, search, and sorting
export const getAllImportantLinks = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortBy = req.query.sort || 'createdAt';
    const sortOrder = req.query.order || 'DESC';

    const whereClause = {};
    if (search) {
      whereClause.url = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await ImportantLink.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    // Attach full image URL if image exists
    const dataWithUrls = rows.map((item) => {
      const obj = item.toJSON();
      obj.image_url = obj.image
        ? `${req.protocol}://${req.get('host')}/uploads/important-links/${obj.image}`
        : null;
      return obj;
    });

    return res.status(200).json({
      total: count,
      data: dataWithUrls,
    });
  } catch (error) {
    console.error('Get Important Links Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a single important link by ID
export const getImportantLinkById = async (req, res) => {
  try {
    const id = req.params.id;

    const importantLink = await ImportantLink.findByPk(id);
    if (!importantLink) {
      return res.status(404).json({ success: false, message: 'Important link not found' });
    }

    const linkData = importantLink.toJSON();
    linkData.image_url = linkData.image
      ? `${req.protocol}://${req.get('host')}/uploads/important-links/${linkData.image}`
      : null;

    return res.status(200).json({
      success: true,
      message: 'Important link fetched successfully',
      importantLink: linkData,
    });
  } catch (error) {
    console.error('Get Important Link by ID Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update an important link by ID (including optional image replacement)
export const updateImportantLink = async (req, res) => {
  try {
    const id = req.params.id;
    const importantLink = await ImportantLink.findByPk(id);

    if (!importantLink) {
      return res.status(404).json({ success: false, message: 'Important link not found' });
    }

    const { url } = req.body;

    if (url !== undefined) importantLink.url = url;

    if (req.file && req.file.path) {
      // Delete old image if exists
      if (importantLink.image) {
        const oldImagePath = path.join(process.cwd(), 'public', 'uploads', 'important-links', importantLink.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      importantLink.image = path.basename(req.file.path);
    }

    await importantLink.save();

    return res.status(200).json({
      success: true,
      message: 'Important link updated successfully',
      importantLink,
    });
  } catch (error) {
    console.error('Update Important Link Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Toggle is_active status of an important link by ID
export const toggleImportantLinkStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const importantLink = await ImportantLink.findByPk(id);

    if (!importantLink) {
      return res.status(404).json({ success: false, message: 'Important link not found' });
    }

    importantLink.is_active = !importantLink.is_active;
    await importantLink.save();

    return res.status(200).json({
      success: true,
      message: `Important link status changed to ${importantLink.is_active ? 'Active' : 'Inactive'}`,
      importantLink,
    });
  } catch (error) {
    console.error('Toggle Important Link Status Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
