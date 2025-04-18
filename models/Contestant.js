const mongoose = require('mongoose');

const contestantSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    post: {
        type: String,
        required: true,
        enum: ['Miss CYON', 'Master CYON']
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    bio: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    photoPublicId: {
        type: String,
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    voteCount: {
        type: Number,
        default: 0
    },
    shareableLink: {
        type: String,
        unique: true
    }
});

const Contestant = mongoose.model('Contestant', contestantSchema);

module.exports = Contestant;