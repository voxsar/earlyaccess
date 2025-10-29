/**
 * Error Handler Middleware
 * Centralized error handling for the API
 */

function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };

  // Handle specific error types
  if (err.message) {
    errorResponse.error.message = err.message;
  }

  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  if (err.code) {
    errorResponse.error.code = err.code;
  }

  // Handle Shopify API errors
  if (err.response?.errors) {
    errorResponse.error.code = 'SHOPIFY_API_ERROR';
    errorResponse.error.message = 'Shopify API request failed';
    errorResponse.error.details = err.response.errors;
  }

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production') {
    delete errorResponse.error.stack;
  } else {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;
