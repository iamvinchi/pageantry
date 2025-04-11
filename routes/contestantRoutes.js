const express = require('express');
const router = express.Router();
const contestantController = require('../controllers/contestantController');
const upload = require('../middlewares/upload'); // Import the upload middleware

router.get('/', contestantController.listContestants);
router.get('/register', contestantController.showRegistrationForm);

// Add the upload.single('photo') middleware to handle file uploads
router.post('/register', upload.single('photo'), contestantController.registerContestant);

router.get('/:id/share', contestantController.showShareLink);

module.exports = router;