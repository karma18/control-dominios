function getDatabaseErrorResponse(error) {
  if (error.code === 'ER_DUP_ENTRY') {
    return {
      statusCode: 409,
      message: 'Record already exists.',
    };
  }

  if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    return {
      statusCode: 409,
      message: 'Record cannot be deleted because it is in use.',
    };
  }

  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return {
      statusCode: 400,
      message: 'Referenced record does not exist.',
    };
  }

  return null;
}

module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const databaseError = getDatabaseErrorResponse(error);
  const statusCode = databaseError?.statusCode || error.statusCode || 500;
  const message = databaseError?.message || error.message || 'Unexpected server error.';

  if (statusCode >= 500) {
    console.error(JSON.stringify({
      level: 'error',
      message: error.message,
      path: req.originalUrl,
      method: req.method,
    }));
  }

  res.status(statusCode).json({
    message,
    details: error.details || null,
  });
};
