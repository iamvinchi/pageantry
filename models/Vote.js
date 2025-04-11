const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    contestant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contestant',
        required: true
    },
    voterEmail: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionReference: {
        type: String,
        required: true,
        unique: true
    },
    voteDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending'
    }
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;