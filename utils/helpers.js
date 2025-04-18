const crypto = require('crypto');

exports.generateShareableLink = () => {
    return crypto.randomBytes(8).toString('hex');
};

exports.catchAsync = fn => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };

exports.AppError = class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      Error.captureStackTrace(this, this.constructor);
    }
  };