const sendApiError = (res, statusCode, message, errors) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export{sendApiError}