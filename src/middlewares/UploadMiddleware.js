import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

 const upload = (options = {}) => {
  let {
    mode, // optional, can be auto-detected
    field = "file",
    maxCount = 5,
    uploadDir = "public/uploads/default",
    allowedTypes = ["image/"],
    maxSize = 5 * 1024 * 1024,
    prefix = "file",
    resize = true,
    width = 400,
    height = 400,
  } = options;

  // Auto-detect mode if not provided
  if (!mode) {
    if (Array.isArray(field)) mode = "fields";
    else mode = "single"; // default
  }

  const storage = multer.memoryStorage();

  const fileFilter = (req, file, cb) => {
    const isAllowed = allowedTypes.some((type) =>
      file.mimetype.startsWith(type)
    );
    if (isAllowed) cb(null, true);
    else cb(new Error(`Invalid file type: ${file.mimetype}`), false);
  };

  const uploader = multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize },
  });

  // Choose multer method dynamically
  let multerMiddleware;
  if (mode === "single") multerMiddleware = uploader.single(field);
  else if (mode === "array") multerMiddleware = uploader.array(field, maxCount);
  else if (mode === "fields") multerMiddleware = uploader.fields(field);
  else throw new Error("Invalid upload mode");

  const processFiles = async (req, res, next) => {
    const files = req.file
      ? [req.file]
      : req.files
      ? Object.values(req.files).flat()
      : [];

    if (!files.length) return next();

    try {
      const fullDir = path.resolve(uploadDir);
      fs.mkdirSync(fullDir, { recursive: true });

      for (const file of files) {
        const ext =
          path.extname(file.originalname) ||
          (file.mimetype.startsWith("image/") ? ".jpeg" : "");
        const filename = `${prefix}-${req.user?.userId || Date.now()}-${Date.now()}${ext}`;
        const filepath = path.join(fullDir, filename);

        if (file.mimetype.startsWith("image/")) {
          let sharpInstance = sharp(file.buffer).toFormat("jpeg", { quality: 90 });

          if (resize) {
            sharpInstance = sharpInstance.resize(width, height, {
              fit: "cover",
              position: "center",
            });
          }

          await sharpInstance.toFile(filepath);
        } else {
          fs.writeFileSync(filepath, file.buffer);
        }

        file.path = path.join(uploadDir.replace("public", ""), filename);

        // Delete old file if provided
        if (req.body.oldFilePath) {
          const oldPath = path.join("public", req.body.oldFilePath);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "File processing failed", error: err.message });
    }
  };

  return [multerMiddleware, processFiles];
};
export default upload