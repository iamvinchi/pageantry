const Contestant = require('../models/Contestant');
const { generateShareableLink } = require('../utils/helpers');
const path = require('path');

// exports.listContestants = async (req, res) => {
//     try {
//         const contestants = await Contestant.find().sort({ voteCount: -1 });
//         res.render('contestants/list', { contestants });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// };

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
        const { fullName, email, phone, age, post, bio } = req.body;
        
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).send('Please upload a photo');
        }

        // Create the photo URL path (relative to your public folder)
        const photo = '/uploads/' + req.file.filename;

        const contestant = new Contestant({
            fullName,
            email,
            phone,
            age,
            post,
            bio,
            photo
        });

        // Generate shareable link
        const shareableLink = generateShareableLink();
        contestant.shareableLink = shareableLink;

        await contestant.save();
        
        res.redirect(`/contestants/${contestant._id}/share`);
    } catch (error) {
        console.error(error);
        
        // If there's an error, you might want to delete the uploaded file
        if (req.file) {
            const fs = require('fs');
            const filePath = path.join(__dirname, '../public', req.file.path);
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting uploaded file:', err);
            });
        }
        
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