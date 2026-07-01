const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSuggestions } = require('../controllers/aiController');

// Protected route: get AI-driven suggestions for menu items
router.get('/suggestions', auth, getSuggestions);

module.exports = router;
