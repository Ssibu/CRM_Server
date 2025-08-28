import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

/**
 * File upload aur image processing ke liye ek flexible middleware.
 * @param {object} options - Configuration options.
 * @param {string} options.uploadDir - File save karne ke liye directory.
 * @param {string} [options.prefix='file'] - Filename ke liye prefix.
 */

export const fileHandler = (options = {}) => {
  const {
    uploadDir = "public/uploads/default",
    prefix = "file",
  } = options;

 
  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only images are allowed!"), false);
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });

 
  // const processAndSave = async (req, res, next) => {
  //   if (!req.file) {
  //     return next();
  //   }

  //   try {
  //     const fullDir = path.resolve(uploadDir);
  //     fs.mkdirSync(fullDir, { recursive: true });

  //     const ext = ".jpeg";
  //     const filename = `${prefix}-${Date.now()}${ext}`;
  //     const filepath = path.join(fullDir, filename);

  //     await sharp(req.file.buffer)
  //       .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
  //       .toFormat("jpeg", { quality: 90 })
  //       .toFile(filepath);

  //     // req.file.path = path.join("uploads", path.basename(uploadDir), filename).replace(/\\/g, "/");
  //       req.file.path = path.join(uploadDir.replace('public', ''), filename).replace(/\\/g, "/");
  //     next();
  //   } catch (err) {
  //     console.error("File processing error:", err);
  //     res.status(500).json({ message: "File processing failed", error: err.message });
  //   }
  // };

  const processAndSave = async (req, res, next) => {
    if (!req.file) {
      return next();
    }

    try {
      const fullDir = path.resolve(uploadDir);
      fs.mkdirSync(fullDir, { recursive: true });

      const ext = ".jpeg";
      // ✅ CHANGE #1: The filename is now the only thing we need
      const filename = `${Date.now()}${ext}`;
      const filepath = path.join(fullDir, filename);

      await sharp(req.file.buffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .toFormat("jpeg", { quality: 90 })
        .toFile(filepath);

      // ✅ CHANGE #2: Store ONLY the filename in req.file.path
      req.file.path = filename;

      next();
    } catch (err) {
      console.error("File processing error:", err);
      res.status(500).json({ message: "File processing failed", error: err.message });
    }
  };
  return [upload.single('image'), processAndSave];
};


