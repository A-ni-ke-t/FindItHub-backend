const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { handleError } = require('../utils/response');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'items';
    switch (req.query.type) {
      case 'items':
        folder = 'items';
        break;
      // Add more cases if needed
      default:
        folder = 'others';
    }
    return {
      folder: `uploads/${folder}`,
      format: file.mimetype.split('/')[1], // jpg, png, pdf, etc.
      public_id: `${Date.now()}_${file.originalname}`,
    };
  },
});

const uploader = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.png', '.jpg', '.jpeg', '.pdf', '.PNG', '.JPG', '.JPEG', '.PDF'];
    const ext = '.' + file.originalname.split('.').pop();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  },
}).any();

const uploaderMiddleware = (req, res, next) => {
  uploader(req, res, function (err) {
    if (err) {
      return handleError({ res, statusCode: 400, error: err.message });
    }
    next();
  });
};

module.exports = { uploaderMiddleware };
