import { toast } from 'react-toastify';

// Error types
export const ErrorTypes = {
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  NETWORK: 'NETWORK_ERROR',
  SERVER: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Function to determine error type
export const getErrorType = (error) => {
  if (!error.response) {
    return ErrorTypes.NETWORK;
  }

  const { status } = error.response;

  switch (status) {
    case 400:
      return ErrorTypes.VALIDATION;
    case 401:
    case 403:
      return ErrorTypes.AUTH;
    case 404:
      return ErrorTypes.NOT_FOUND;
    case 500:
      return ErrorTypes.SERVER;
    default:
      return ErrorTypes.UNKNOWN;
  }
};

// Function to get user-friendly error message
export const getErrorMessage = (error) => {
  const errorType = getErrorType(error);
  const defaultMessage = 'An unexpected error occurred. Please try again.';

  // If we have a response with an error message, use it
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Otherwise, provide a user-friendly message based on error type
  switch (errorType) {
    case ErrorTypes.VALIDATION:
      return error.response?.data?.errors?.[0]?.message || 'Please check your input and try again.';
    case ErrorTypes.AUTH:
      return 'You are not authorized to perform this action. Please log in and try again.';
    case ErrorTypes.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection.';
    case ErrorTypes.SERVER:
      return 'The server encountered an error. Please try again later.';
    case ErrorTypes.NOT_FOUND:
      return 'The requested resource was not found.';
    default:
      return defaultMessage;
  }
};

// Main error handler function
export const handleError = (error, options = {}) => {
  const {
    showToast = true,
    logError = true,
    defaultMessage = 'An error occurred'
  } = options;

  // Get error details
  const errorType = getErrorType(error);
  const errorMessage = getErrorMessage(error);

  // Log error in development
  if (logError && process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      type: errorType,
      message: errorMessage,
      error: error,
      response: error.response?.data,
      status: error.response?.status
    });
  }

  // Show toast notification
  if (showToast) {
    toast.error(errorMessage, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }

  // Return error details
  return {
    type: errorType,
    message: errorMessage,
    originalError: error
  };
};

// Async error handler wrapper
export const withErrorHandler = (fn, options = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error, options);
    }
  };
};
