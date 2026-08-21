const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  const isOperational = err.isOperational;

  if (process.env.NODE_ENV === 'production') {
    res.status(statusCode).json({
      error: isOperational ? err.message : 'Internal Server Error',
    });
    return;
  }

  res.status(statusCode).json({
    error: err.message,
    stack: err.stack,
  });
};

module.exports = errorHandler;
