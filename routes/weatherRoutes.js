// routes/weatherRoutes.js
const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Weather API endpoint - usually public, no authentication needed
router.get('/', weatherController.getLiveWeatherData);

module.exports = router;