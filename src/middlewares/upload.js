import multer from 'multer';
import path from 'path';

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // This directory must exist in your server folder: /public/uploads/
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Check for a wide range of file types (images and documents)
const checkFileType = (file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: File type not supported!');
  }
};

// Initialize upload variable for a single file upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB Limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('document'); // The frontend FormData key for the file must be 'document'

export default upload;