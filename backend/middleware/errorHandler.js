const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message,
    ...(isProd ? {} : { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error('Route not found'));
};

module.exports = {
  errorHandler,
  notFound
};

