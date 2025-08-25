import multer from 'multer';
import path from 'path';

// Set up the storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Files will be saved in the 'public/uploads' directory relative to the server root
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// A mapping of allowed file extensions to their corresponding valid MIME types
const allowedFileTypes = {
    // Images
    '.jpg': ['image/jpeg'],
    '.jpeg': ['image/jpeg'],
    '.png': ['image/png'],
    '.webp': ['image/webp'],
    '.gif': ['image/gif'],
    
    // Documents
    '.pdf': ['application/pdf'],
    '.doc': ['application/msword', 'application/octet-stream'], // Allow generic stream for older .doc
    '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],

    // --- ADDED: Excel Files ---
    '.xls': ['application/vnd.ms-excel'],
    '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
};

// A robust function to validate the uploaded file
const checkFileType = (file, cb) => {
    // 1. Get the file extension from the original filename
    const extension = path.extname(file.originalname).toLowerCase();
    
    // 2. Check if this extension is in our list of allowed types
    const allowedMimeTypes = allowedFileTypes[extension];
    
    if (!allowedMimeTypes) {
        // If the extension is not found, reject the file
        return cb(new Error('Error: File extension not allowed!'));
    }
    
    // 3. Check if the file's actual MIME type (reported by the browser)
    //    matches one of the valid types for that extension.
    if (allowedMimeTypes.includes(file.mimetype)) {
        // Success, the file is valid
        return cb(null, true);
    } else {
        // The extension is valid, but the MIME type is wrong. This could be a renamed file.
        // For security, we reject it.
        console.warn(`Warning: File "${file.originalname}" has extension "${extension}" but an incorrect MIME type "${file.mimetype}".`);
        return cb(new Error('Error: File MIME type does not match its extension!'));
    }
};

// Initialize the Multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 10 }, // Set a 10MB file size limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('document'); // This expects the file to be sent with the field name 'document'

export default upload;