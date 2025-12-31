const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
// Files will be available in req.files as Buffer
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedImageTypes = /jpeg|jpg|png|gif|svg/;
  const extname = allowedImageTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedImageTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, svg)'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

module.exports = upload;
