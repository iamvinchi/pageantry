const crypto = require('crypto');

exports.generateShareableLink = () => {
    return crypto.randomBytes(8).toString('hex');
};

// Add any other helper functions you might need