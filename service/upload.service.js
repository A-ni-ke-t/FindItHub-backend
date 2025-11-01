const { handleResponse } = require("../utils/response");

const upload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return handleResponse({ res, data: [], message: "No files uploaded" });
    }

    // Map to Cloudinary URLs
    const urls = req.files.map(f => f.path); // f.path is the Cloudinary URL

    handleResponse({ res, data: urls, message: "Files uploaded successfully" });
  } catch (err) {
    console.error(err);
    handleResponse({ res, data: [], message: err.message });
  }
};

module.exports = { upload };
