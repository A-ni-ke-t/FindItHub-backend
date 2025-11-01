// utils/response.js
const sendResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
      status: statusCode,
      success: true,
      message,
      data,
    });
  };
  
  const sendError = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
      status: statusCode,
      success: false,
      message,
      data,
    });
  };
  
  module.exports = { sendResponse, sendError };
  