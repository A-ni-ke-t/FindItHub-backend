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

const handleResponse = ({
  res,
  statusCode = 200,
  msg = "Success",
  data = {},
  result = 1,
}) => {
  res.status(statusCode).send({
    result,
    msg,
    data,
  });
};

const handleError = ({
  res,
  statusCode = 500,
  error,
  err = "error",
  result = 0,
  language = "English",
}) => {
  err = error || err;
  if (err.code === 11000) {
    let keyName = "some arbitrary key";
    const matches = err.message.match(/index:(.*)_1/);
    if (matches) keyName = matches[1] || keyName;
    statusCode = 409;
    err = `${capitalize(keyName.trim())} you entered is already registered`;
  }
  res.error = err;
  const messageOrCode = err instanceof Error ? err.message : err.msg || err;
  let message = messageOrCode;

  res.status(statusCode).send({
    result,
    msg: message,
  });
};

module.exports = { sendResponse, sendError, handleResponse, handleError };
