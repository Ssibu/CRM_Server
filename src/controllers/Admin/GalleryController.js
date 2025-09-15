import GalaryCategory from "../../models/GalleryCategory.js";
import PhotoGallery from '../../models/PhotoGallery.js';
import path from 'path';
import fs from 'fs';
import VideoGallery from "../../models/VideoGallery.js";
import { Op } from 'sequelize';
import sequelize from "../../../config/db.js";
import { log } from "../../services/LogService.js";

// Validation helper

const validateCategoryData = async (data, categoryId = null) => {
  let { en_category, od_category } = data;

  // Trim spaces only
  en_category = en_category?.trim();
  od_category = od_category?.trim();

  // Required check
  if (!en_category || !od_category) {
    throw new Error("Both English and Odia category names are required.");
  }

  // Max length check
  if (en_category.length > 101) {
    throw new Error("English category name must not exceed 101 characters.");
  }
  if (od_category.length > 101) {
    throw new Error("Odia category name must not exceed 101 characters.");
  }

  // Duplicate check for English
  const duplicateEn = await GalaryCategory.findOne({
    where: {
      en_category: en_category, // case-sensitive exact match
      ...(categoryId ? { id: { [Op.ne]: categoryId } } : {}),
    },
  });
  if (duplicateEn) {
    throw new Error("A category with this English name already exists.");
  }

  // Duplicate check for Odia
  const duplicateOd = await GalaryCategory.findOne({
    where: {
      od_category: od_category, // case-sensitive exact match
      ...(categoryId ? { id: { [Op.ne]: categoryId } } : {}),
    },
  });
  if (duplicateOd) {
    throw new Error("A category with this Odia name already exists.");
  }

  return { en_category, od_category }; // return cleaned values
};


// ===================== CREATE =====================

export const registerSingleCategory = async (req, res) => {
  try {
    const { en_category, od_category, category_type, status } = req.body;

    // Validate & clean input
    const { en_category: cleanEn, od_category: cleanOd } =
      await validateCategoryData({ en_category, od_category });

    let thumbnail = null;
    if (req.file && req.file.path) {
      thumbnail = path.basename(req.file.path);
    }

    const category = await GalaryCategory.create({
      en_category: cleanEn,
      od_category: cleanOd,
      category_type,
      status: status !== undefined ? status : true,
      thumbnail,
    });

    await log({
      req,
      action: "CREATE",
      page_name: "ADD GALLERY CATEGORY",
      target: category.en_category,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


// ===================== UPDATE =====================
export const updateSingleCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await GalaryCategory.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const { en_category, od_category, category_type, status } = req.body;

    // Validate & clean input (ignore self)
    const { en_category: cleanEn, od_category: cleanOd } =
      await validateCategoryData({ en_category, od_category }, categoryId);

    // Update fields
    if (cleanEn !== undefined) category.en_category = cleanEn;
    if (cleanOd !== undefined) category.od_category = cleanOd;
    if (category_type !== undefined) category.category_type = category_type;
    if (status !== undefined) category.status = status === "true" || status === true;

    // Thumbnail handling remains same ...

    category.updated_at = new Date();
    await category.save();

    await log({
      req,
      action: "UPDATE",
      page_name: "GALLERY CATEGORY FORM",
      target: category.en_category,
    });

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// ------------------------Not using---------------------------------------------

export const registerMultipleCategories = async (req, res) => {
  try {
    const categories = req.body.categories; // Expect array of categories in req.body.categories

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ success: false, message: 'categories must be a non-empty array' });
    }

    // Bulk create
    const createdCategories = await GalaryCategory.bulkCreate(categories);

    
    res.status(201).json({ success: true, categories: createdCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ------------------------Not using---------------------------------------------

export const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_category", "od_category", "category_type", "status", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_category: { [Op.like]: `%${search}%` } },
          { od_category: { [Op.like]: `%${search}%` } },
          { category_type: { [Op.like]: `%${search}%` } },
        ],
      })
    };

    const { count, rows } = await GalaryCategory.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    // Process rows to add full thumbnail URLs
    const categoriesWithUrls = rows.map((cat) => {
      const data = cat.toJSON();
      const filename = (data.thumbnail || "").replace(/\\/g, "/");
      const imageUrl = filename ? `${req.protocol}://${req.get('host')}/uploads/categories/${filename}` : null;
      return { ...data, thumbnail_url: imageUrl };
    });


    await log({
      req,
      action:"READ",
      page_name:"GALLERY CATEGORY LIST",
      // target: ,
     
    });

    // Return data in the standard format for our hook
    res.status(200).json({
      total: count,
      data: categoriesWithUrls,
    });

  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// use

export const getCategoryById = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await GalaryCategory.findByPk(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const categoryData = category.toJSON();
    const filename = (categoryData.thumbnail || '').replace(/\\/g, '/');

    const imageUrl = filename
      ? `${req.protocol}://${req.get('host')}/uploads/categories/${filename}`
      : null;



      await log({
      req,
      action:"READ ",
      page_name:"GALLERY CATEGORY FORM",
      // target:en_category ,
     
    });

    return res.status(200).json({
      success: true,
      message: 'Category fetched successfully',
      category: {
        ...categoryData,
        thumbnail_url: imageUrl,
      },
    });
  } catch (error) {
    console.error('Get Category by ID Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
export const toggleGalaryCategoryStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await GalaryCategory.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Gallery category not found' });
    }

    category.status = !category.status; // Toggle the status
    await category.save();


   await log({
      req,
      action:"UPDATE ",
      page_name:"GALLERY CATEGORY LIST",
      target:category.en_category ,
     
    });

    res.status(200).json({
      message: `Gallery category status changed to ${category.status ? 'Active' : 'Inactive'}`,
      category,
    });
  } catch (error) {
    console.error('Error toggling gallery category status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//FOR-PHOTO GALARY--------------------------------------------------------------------------------------
// Register single photo (with photo upload and with url)
// Validation helper
// Utility: normalize text (remove extra spaces)
const normalizeText = (text) => {
  return text?.trim().replace(/\s+/g, " ") || "";
};

// Validation + duplicate check
const validatePhotoData = async (data, photoId = null) => {
  let { en_title, od_title, phototype, photolink } = data;

  // Normalize
  const cleanedEn = normalizeText(en_title);
  const cleanedOd = normalizeText(od_title);

  // Required check
  if (!cleanedEn || !cleanedOd) {
    throw new Error("Both English and Odia titles are required.");
  }

  // Max length check
  if (cleanedEn.length > 101) {
    throw new Error("English title must not exceed 101 characters.");
  }
  if (cleanedOd.length > 101) {
    throw new Error("Odia title must not exceed 101 characters.");
  }

  // Duplicate check (ignore same photo when updating)
  const duplicate = await PhotoGallery.findOne({
    where: {
      en_title: cleanedEn,
      ...(photoId ? { id: { [Op.ne]: photoId } } : {}),
    },
  });

  if (duplicate) {
    throw new Error("English title already exists.");
  }

  const duplicateOdia = await PhotoGallery.findOne({
    where: {
      od_title: cleanedOd,
      ...(photoId ? { id: { [Op.ne]: photoId } } : {}),
    },
  });

  if (duplicateOdia) {
    throw new Error("Odia title already exists.");
  }

  // Photo type validation
  if (!["file", "link"].includes(phototype)) {
    throw new Error("Invalid phototype. Must be either 'file' or 'link'.");
  }

  if (phototype === "link" && (!photolink || photolink.trim() === "")) {
    throw new Error("Photo link is required when phototype is 'link'.");
  }

  return { en_title: cleanedEn, od_title: cleanedOd };
};


// update photo controller
// create photo controller
export const registerSinglePhoto = async (req, res) => {
  try {
    const { category_id, en_title, od_title, phototype, photolink } = req.body;

    // Run validation (await required!)
    const { en_title: cleanEn, od_title: cleanOd } = await validatePhotoData(
      { en_title, od_title, phototype, photolink }
    );

    // Check required category
    const category = await GalaryCategory.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    let photofile = null;
    let finalPhotoLink = null;

    if (phototype === "file") {
      if (!req.file || !req.file.path) {
        return res.status(400).json({ success: false, message: "Photo file is required for phototype 'file'." });
      }
      photofile = path.basename(req.file.path);
    }

    if (phototype === "link") {
      finalPhotoLink = photolink.trim();
    }

    const photo = await PhotoGallery.create({
      category_id,
      en_title: cleanEn,
      od_title: cleanOd,
      phototype,
      photofile,
      photolink: finalPhotoLink,
    });

    await log({
      req,
      action: "CREATE",
      page_name: "PHOTO GALLERY FORM",
      target: cleanEn,
    });

    return res.status(201).json({
      success: true,
      message: "Photo registered successfully",
      photo,
    });
  } catch (error) {
    console.error("Create Photo Error:", error);
    return res.status(400).json({ success: false, message: error.message || "Internal server error" });
  }
};


// update photo contoller
// update photo controller
export const updateSinglePhoto = async (req, res) => {
  const photoId = req.params.id;

  try {
    const photo = await PhotoGallery.findByPk(photoId);
    if (!photo) {
      return res.status(404).json({ success: false, message: "Photo not found" });
    }

    const { category_id, en_title, od_title, phototype, photolink } = req.body;

    // Run validation with current photoId to ignore self
    if (en_title !== undefined || od_title !== undefined || phototype !== undefined) {
      const { en_title: cleanEn, od_title: cleanOd } = await validatePhotoData(
        {
          en_title: en_title ?? photo.en_title,
          od_title: od_title ?? photo.od_title,
          phototype: phototype ?? photo.phototype,
          photolink: photolink ?? photo.photolink,
        },
        photoId
      );

      if (en_title !== undefined) photo.en_title = cleanEn;
      if (od_title !== undefined) photo.od_title = cleanOd;
    }

    // Update category if provided
    if (category_id !== undefined) {
      const category = await GalaryCategory.findByPk(category_id);
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
      }
      photo.category_id = category_id;
    }

    // Handle file/link logic
    if (phototype !== undefined) {
      photo.phototype = phototype;

      if (phototype === "file") {
        if (req.file) {
          const newFilename = path.basename(req.file.path);
          if (photo.photofile) {
            const oldPath = path.join(process.cwd(), "public", "uploads", "photos", photo.photofile);
            fs.access(oldPath, fs.constants.F_OK, (err) => {
              if (!err) fs.unlink(oldPath, () => {});
            });
          }
          photo.photofile = newFilename;
          photo.photolink = null;
        } else if (req.body.photo === "") {
          if (photo.photofile) {
            const oldPath = path.join(process.cwd(), "public", "uploads", "photos", photo.photofile);
            fs.access(oldPath, fs.constants.F_OK, (err) => {
              if (!err) fs.unlink(oldPath, () => {});
            });
          }
          photo.photofile = null;
        }
      } else if (phototype === "link") {
        const trimmedLink = (photolink || "").trim();
        photo.photolink = trimmedLink || null;

        if (photo.photofile) {
          const oldPath = path.join(process.cwd(), "public", "uploads", "photos", photo.photofile);
          fs.access(oldPath, fs.constants.F_OK, (err) => {
            if (!err) fs.unlink(oldPath, () => {});
          });
        }

        photo.photofile = null;
      }
    }

    await photo.save();

    await log({
      req,
      action: "UPDATE",
      page_name: "PHOTO GALLERY FORM",
      target: photo.en_title,
    });

    return res.status(200).json({
      success: true,
      message: "Photo updated successfully",
      photo,
    });
  } catch (error) {
    console.error("Update Photo Error:", error);
    return res.status(400).json({ success: false, message: error.message || "Internal server error" });
  }
};


export const getAllPhotos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "status", "category_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
          { '$category.en_category$': { [Op.like]: `%${search}%` } },
        ],
      })
    };

    const order = sortBy === 'category_name'
      ? [[{ model: GalaryCategory, as: 'category' }, 'en_category', sortOrder.toUpperCase()]]
      : [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await PhotoGallery.findAndCountAll({
      where: whereClause,
      include: [{
        model: GalaryCategory,
        as: 'category',
        attributes: [],
      }],
      attributes: {
        include: [
          [sequelize.col('category.en_category'), 'category_name']
        ]
      },
      order,
      limit,
      offset,
      distinct: true,
    });

    const photosWithUrls = rows.map((photo) => {
      const data = photo.toJSON();

      let photo_url = null;
      if (data.phototype === 'file' && data.photofile) {
        const filename = data.photofile.replace(/\\/g, '/');
        photo_url = `${req.protocol}://${req.get('host')}/uploads/photos/${filename}`;
      } else if (data.phototype === 'link' && data.photolink) {
        photo_url = data.photolink;
      }

      return { ...data, photo_url };
    });

   await log({
      req,
      action:"READ ",
      page_name:"PHOTO GALLERY LIST",
      // target:en_title ,
     
    });
  


    return res.status(200).json({
      total: count,
      data: photosWithUrls,
    });

  } catch (error) {
    console.error('Get Photos Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Get photo by ID
export const getPhotoById = async (req, res) => {
  const photoId = req.params.id;

  try {
    const photo = await PhotoGallery.findByPk(photoId, {
      include: [{ model: GalaryCategory, as: 'category' }],
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    const photoData = photo.toJSON();

    let photo_url = null;
    if (photoData.phototype === 'file' && photoData.photofile) {
      const filename = photoData.photofile.replace(/\\/g, '/');
      photo_url = `${req.protocol}://${req.get('host')}/uploads/photos/${filename}`;
    } else if (photoData.phototype === 'link' && photoData.photolink) {
      photo_url = photoData.photolink;
    }

   await log({
      req,
      action:"READ ",
      page_name:"PHOTO GALLERY FORM",
      // target:en_title ,
     
    });


    return res.status(200).json({
      success: true,
      message: 'Photo fetched successfully',
      photo: {
        ...photoData,
        photo_url,
      },
    });
  } catch (error) {
    console.error('Get Photo by ID Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
// Update single photo (with optional photo replacement)

// Optional: Toggle photo status (if you have a status field for photos)
export const togglePhotoStatus = async (req, res) => {
  const photoId = req.params.id;

  try {
    const photo = await PhotoGallery.findByPk(photoId);

    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    if (photo.status === undefined) {
      return res.status(400).json({ success: false, message: 'Photo does not have a status field' });
    }

    photo.status = !photo.status;
    await photo.save();

    await log({
      req,
      action:"UPDATE ",
      page_name:"PHOTO GALLERY LIST",
      target:photo.en_title ,
     
    });

    res.status(200).json({
      success: true,
      message: `Photo status changed to ${photo.status ? 'Active' : 'Inactive'}`,
      photo,
    });
  } catch (error) {
    console.error('Toggle Photo Status Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


//For Video Galary---------------------------------------------------------------------------------------
// Register single video (with video upload or video URL)
export const registerSingleVideo = async (req, res) => {
  try {
    const { category_id, en_title, od_title, videotype, videolink } = req.body;

    // ==== Required fields check ====
    if (!category_id || !en_title || !od_title || !videotype) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: category_id, en_title, od_title, videotype",
      });
    }

    // ==== Trim and validate title lengths ====
    const trimmedEnTitle = en_title.trim();
    const trimmedOdTitle = od_title.trim();

    if (trimmedEnTitle.length < 1 || trimmedEnTitle.length > 100) {
      return res.status(400).json({
        success: false,
        message: "English title must be between 1 and 100 characters.",
      });
    }

    if (trimmedOdTitle.length < 1 || trimmedOdTitle.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Odia title must be between 1 and 100 characters.",
      });
    }

    // ==== Validate videotype ====
    if (!['file', 'link'].includes(videotype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid videotype. Must be either 'file' or 'link'.",
      });
    }

    // ==== Check if category exists ====
    const category = await GalaryCategory.findByPk(category_id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // ==== Check for duplicate titles ====
    const existingVideo = await VideoGallery.findOne({
      where: {
        en_title: trimmedEnTitle,
      },
    });

    const existingOdiaVideo = await VideoGallery.findOne({
      where: {
        od_title: trimmedOdTitle,
      },
    });

    if (existingVideo) {
      return res.status(409).json({
        success: false,
        message: "A video with the same English title already exists.",
      });
    }

    if (existingOdiaVideo) {
      return res.status(409).json({
        success: false,
        message: "A video with the same Odia title already exists.",
      });
    }

    // ==== Handle file or link ====
    let videofile = null;
    let finalVideoLink = null;

    if (videotype === 'file') {
      if (!req.file || !req.file.path) {
        return res.status(400).json({
          success: false,
          message: "Video file is required for videotype 'file'.",
        });
      }
      videofile = path.basename(req.file.path);
    }

    if (videotype === 'link') {
      if (!videolink || videolink.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Video link is required for videotype 'link'.",
        });
      }
      finalVideoLink = videolink.trim();
    }

    // ==== Create the video ====
    const video = await VideoGallery.create({
      category_id,
      en_title: trimmedEnTitle,
      od_title: trimmedOdTitle,
      videotype,
      videofile,
      videolink: finalVideoLink,
    });

    // ==== Log the action ====
    await log({
      req,
      action: "CREATE",
      page_name: "VIDEO GALLERY FORM",
      target: trimmedEnTitle,
    });

    return res.status(201).json({
      success: true,
      message: "Video registered successfully.",
      video,
    });

  } catch (error) {
    console.error("Error creating video:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

//update video controller
export const updateSingleVideo = async (req, res) => {
  const videoId = req.params.id;

  try {
    const video = await VideoGallery.findByPk(videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    const { category_id, en_title, od_title, videotype, videolink } = req.body;

    // Validate and update category if provided
    if (category_id !== undefined) {
      const category = await GalaryCategory.findByPk(category_id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
      video.category_id = category_id;
    }

    // Validate and update English title if provided
    if (en_title !== undefined) {
      const trimmedEnTitle = en_title.trim();
      if (trimmedEnTitle.length < 1 || trimmedEnTitle.length > 100) {
        return res.status(400).json({
          success: false,
          message: "English title must be between 1 and 100 characters.",
        });
      }

      // Check duplicate excluding current video
      const duplicateEn = await VideoGallery.findOne({
        where: {
          en_title: trimmedEnTitle,
          id: { [Op.ne]: videoId },
        },
      });

      if (duplicateEn) {
        return res.status(409).json({
          success: false,
          message: "A video with the same English title already exists.",
        });
      }

      video.en_title = trimmedEnTitle;
    }

    // Validate and update Odia title if provided
    if (od_title !== undefined) {
      const trimmedOdTitle = od_title.trim();
      if (trimmedOdTitle.length < 1 || trimmedOdTitle.length > 100) {
        return res.status(400).json({
          success: false,
          message: "Odia title must be between 1 and 100 characters.",
        });
      }

      // Check duplicate excluding current video
      const duplicateOd = await VideoGallery.findOne({
        where: {
          od_title: trimmedOdTitle,
          id: { [Op.ne]: videoId },
        },
      });

      if (duplicateOd) {
        return res.status(409).json({
          success: false,
          message: "A video with the same Odia title already exists.",
        });
      }

      video.od_title = trimmedOdTitle;
    }

    // Validate videotype if provided
    if (videotype !== undefined) {
      if (!['file', 'link'].includes(videotype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid videotype. Must be either 'file' or 'link'.",
        });
      }

      video.videotype = videotype;

      if (videotype === 'file') {
        if (req.file) {
          const newFilename = path.basename(req.file.path);

          // Delete old file if exists
          if (video.videofile) {
            const oldPath = path.join(process.cwd(), 'public', 'uploads', 'videos', video.videofile);
            fs.access(oldPath, fs.constants.F_OK, (err) => {
              if (!err) {
                fs.unlink(oldPath, (unlinkErr) => {
                  if (unlinkErr) console.error('Failed to delete old video:', unlinkErr);
                });
              }
            });
          }

          video.videofile = newFilename;
          video.videolink = null;
        } else if (req.body.video === "") {
          // Remove old file if frontend sent empty string
          if (video.videofile) {
            const oldPath = path.join(process.cwd(), 'public', 'uploads', 'videos', video.videofile);
            fs.access(oldPath, fs.constants.F_OK, (err) => {
              if (!err) {
                fs.unlink(oldPath, (unlinkErr) => {
                  if (unlinkErr) console.error('Failed to delete old video:', unlinkErr);
                });
              }
            });
          }
          video.videofile = null;
        }
      } else if (videotype === 'link') {
        const trimmedLink = (videolink || '').trim();

        if (trimmedLink === '') {
          video.videolink = null;
        } else {
          video.videolink = trimmedLink;
        }

        // Remove uploaded file if exists
        if (video.videofile) {
          const oldPath = path.join(process.cwd(), 'public', 'uploads', 'videos', video.videofile);
          fs.access(oldPath, fs.constants.F_OK, (err) => {
            if (!err) {
              fs.unlink(oldPath, (unlinkErr) => {
                if (unlinkErr) console.error('Failed to delete old video:', unlinkErr);
              });
            }
          });
        }

        video.videofile = null;
      }
    }

    await video.save();

    await log({
      req,
      action: "UPDATE",
      page_name: "VIDEO GALLERY FORM",
      target: video.en_title,
    });

    return res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      video,
    });

  } catch (error) {
    console.error('Update Video Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



// Get all videos with pagination, search, sorting
export const getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "createdAt";
    const sortOrder = req.query.order || "DESC";

    const allowedSortColumns = ["en_title", "od_title", "status", "category_name", "createdAt"];
    if (!allowedSortColumns.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort column" });
    }

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        [Op.or]: [
          { en_title: { [Op.like]: `%${search}%` } },
          { od_title: { [Op.like]: `%${search}%` } },
          { '$category.en_category$': { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    const order = sortBy === 'category_name'
      ? [[{ model: GalaryCategory, as: 'category' }, 'en_category', sortOrder.toUpperCase()]]
      : [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await VideoGallery.findAndCountAll({
      where: whereClause,
      include: [{
        model: GalaryCategory,
        as: 'category',
        attributes: [],
      }],
      attributes: {
        include: [
          [VideoGallery.sequelize.col('category.en_category'), 'category_name']
        ]
      },
      order,
      limit,
      offset,
      distinct: true,
    });

    const videosWithUrls = rows.map((video) => {
      const data = video.toJSON();

      let video_url = null;
      if (data.videotype === 'file' && data.videofile) {
        const filename = data.videofile.replace(/\\/g, '/');
        video_url = `${req.protocol}://${req.get('host')}/uploads/videos/${filename}`;
      } else if (data.videotype === 'link' && data.videolink) {
        video_url = data.videolink;
      }

      return { ...data, video_url };
    });

    await log({
      req,
      action:"READ ",
      page_name:"VIDEO GALLERY LIST",
      // target:en_title ,
     
    });

    res.status(200).json({
      total: count,
      data: videosWithUrls,
    });
  } catch (error) {
    console.error('Get Videos Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// Get video by ID
export const getVideoById = async (req, res) => {
  const videoId = req.params.id;

  try {
    const video = await VideoGallery.findByPk(videoId, {
      include: [{ model: GalaryCategory, as: 'category' }],
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found',
      });
    }

    const videoData = video.toJSON();

    let video_url = null;
    if (videoData.videotype === 'file' && videoData.videofile) {
      const filename = videoData.videofile.replace(/\\/g, '/');
      video_url = `${req.protocol}://${req.get('host')}/uploads/videos/${filename}`;
    } else if (videoData.videotype === 'link' && videoData.videolink) {
      video_url = videoData.videolink;
    }

    await log({
      req,
      action:"READ ",
      page_name:"VIDEO GALLERY FORM",
      // target:en_title ,
     
    });
    return res.status(200).json({
      success: true,
      message: 'Video fetched successfully',
      video: {
        ...videoData,
        video_url,
      },
    });
  } catch (error) {
    console.error('Get Video by ID Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
// Optional: Toggle video status
export const toggleVideoStatus = async (req, res) => {
  const videoId = req.params.id;

  try {
    const video = await VideoGallery.findByPk(videoId);

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    if (video.status === undefined) {
      return res.status(400).json({ success: false, message: 'Video does not have a status field' });
    }

    video.status = !video.status;
    await video.save();
    await log({
      req,
      action:"UPDATE ",
      page_name:"VIDEO GALLERY FORM",
      target: video.en_title ,
     
    });


    res.status(200).json({
      success: true,
      message: `Video status changed to ${video.status ? 'Active' : 'Inactive'}`,
      video,
    });
  } catch (error) {
    console.error('Toggle Video Status Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


