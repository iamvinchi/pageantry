const Contestant = require('../models/Contestant');
const { generateShareableLink } = require('../utils/helpers');
const { cloudinary } = require('../config/cloudinary');
const path = require('path');

exports.listContestants = async (req, res) => {
    try {
        let query = {};
        
        // Add search filter if search query exists
        if (req.query.search) {
            query.fullName = { $regex: new RegExp(req.query.search, 'i') };
        }
        
        const contestants = await Contestant.find(query).sort({ voteCount: -1 });
        
        res.render('contestants/list', { 
            contestants,
            searchQuery: req.query.search || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.showRegistrationForm = (req, res) => {
    res.render('contestants/register');
};


exports.registerContestant = async (req, res) => {
    try {
        const { fullName, phone, age, post, bio } = req.body;
        
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).send('Please upload a photo');
        }

        // Create contestant with Cloudinary URL
        const contestant = new Contestant({
            fullName,
            phone,
            age,
            post,
            bio,
            photo: req.file.path,
            photoPublicId: req.file.filename
        });

        // Generate shareable link
        const shareableLink = generateShareableLink();
        contestant.shareableLink = shareableLink;

        await contestant.save();
        
        res.redirect(`/contestants/${contestant._id}/share`);
    } catch (error) {
        console.error(error);
        
        // If there's an error, delete the uploaded file from Cloudinary
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename);
        }
        
        res.status(500).send('Server Error');
    }
};

// Add this new method to handle image deletion when deleting contestants
exports.deleteContestant = async (req, res) => {
    try {
        const contestant = await Contestant.findById(req.params.id);
        
        if (!contestant) {
            return res.status(404).send('Contestant not found');
        }

        // Delete image from Cloudinary
        if (contestant.photoPublicId) {
            await cloudinary.uploader.destroy(contestant.photoPublicId);
        }

        await Contestant.findByIdAndDelete(req.params.id);
        
        res.redirect('/contestants');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};

exports.showShareLink = async (req, res) => {
    try {
        const contestant = await Contestant.findById(req.params.id);
        if (!contestant) {
            return res.status(404).send('Contestant not found');
        }
        
        res.render('contestants/share', { 
            contestant,
            shareUrl: `${process.env.BASE_URL}/votes/${contestant.shareableLink}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};