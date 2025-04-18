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

  exports.showError = (message) =>{
    console.error(message);

    document.addEventListener('DOMContentLoaded', () => {
        const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 15px;
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ef9a9a;
      border-radius: 4px;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
    
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
      });

    
  }