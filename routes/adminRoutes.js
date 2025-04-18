const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middlewares/upload'); // Import the upload middleware

router.get('/login', adminController.showLoginForm);
router.post('/login', adminController.login);

router.get('/add-admin', adminController.showSignUpForm);
router.post('/add-admin', adminController.addAdmin);

router.get('/logout', adminController.logout);

router.get('/', adminController.protect, adminController.listContestants);

router.get('/register', adminController.protect, adminController.showRegistrationForm);

router.post('/register', adminController.protect, upload.single('photo'), adminController.registerContestant);

router.get('/contestants/:id', adminController.protect, adminController.showUpdateForm);

router.post('/contestants/:id', adminController.protect, upload.single('photo'), adminController.updateContestant);

router.delete('/contestants/:id', adminController.protect, adminController.deleteContestant);

router.get('/:id/share', adminController.protect, adminController.showShareLink);

module.exports = router;