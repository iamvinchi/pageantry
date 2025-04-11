const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');

router.get('/:link', voteController.showVotePage);
router.post('/process', voteController.processVote);
router.get('/success/:reference', voteController.showSuccessPage);

module.exports = router;