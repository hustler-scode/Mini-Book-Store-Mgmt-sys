const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors ? err.errors.map(e => e.message || e) : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;

