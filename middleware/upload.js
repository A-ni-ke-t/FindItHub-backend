const { handleError } = require("../utils/response");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'items';
    switch (req.query.type) {
      case 'items':
        folder = 'items';
        break;
      // Add more cases if needed
    }
    const fullPath = path.join(path.resolve(), `/public/uploads/${folder}/`);
    checkIfDirectoryExists(fullPath);
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploader = multer({
  storage,

  fileFilter: function (req, file, callback) {
    const ext = path.extname(file.originalname);
    if (
      ext !== '.png' &&
      ext !== '.jpg' &&
      ext !== '.jpeg' &&
      ext !== '.pdf' &&
      ext !== '.PNG' &&
      ext !== '.JPG' &&
      ext !== '.JPEG' &&
      ext !== '.PDF'
    ) {
      return callback(new Error('Invalid mime type'));
    }
    callback(null, true);
  },
}).any();

function checkIfDirectoryExists(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

 const uploaderMiddleware = (req, res, next) => {
  uploader(req, res, function (err) {
    if (err) {
      return handleError({ res, statusCode: 400, error: err.message });
    }
    next();
  });
};

module.exports = { uploaderMiddleware };

