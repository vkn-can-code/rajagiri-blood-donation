const multer = require('multer');
const path = require('path');

// Configure multer to store files on the local disk
const storage = multer.diskStorage({
  // Define the destination folder for the uploaded files
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  // Define the filename to avoid name conflicts
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
