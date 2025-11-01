const { handleResponse } = require("../utils/response");

const upload = async (req, res) => {
  const folder = req.query.type ? `/${req.query.type}` : "";
  const urls = req?.files?.map((f) => `/uploads${folder}/${f.filename}`) || [];
  handleResponse({ res, data: urls });
};

module.exports = { upload };
