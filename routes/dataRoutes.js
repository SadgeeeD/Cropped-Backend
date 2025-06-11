// routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { authenticateToken } = require('../middleware/authMiddleware'); // For protected routes

// Add this to see if the route is hit
router.use((req, res, next) => {
    console.log(`[BACKEND] Route hit: ${req.method} ${req.originalUrl}`);
    next();
});


// --- SensorReadings Routes (These will call the External API via dataService) ---
// GET all sensor readings (from external API)
router.get('/readings', authenticateToken, dataController.getSensorReadings);

// GET sensor readings by a specific SensorId (from external API)
router.get('/readings/sensor/:sensorId', authenticateToken, dataController.getSensorReadingsBySensorId);

// GET the latest sensor reading for a specific SensorId (from external API)
router.get('/readings/latest/:sensorId', authenticateToken, dataController.getLatestSensorReadingBySensorId);

// GET sensor readings by a specific PlantId (from external API)
router.get('/readings/plant/:plantId', authenticateToken, dataController.getSensorReadingsByPlantId);

// POST a new sensor reading (to external API)
router.post('/readings', authenticateToken, dataController.createSensorReading);

// --- NEW: Route to trigger fetching from external API and saving to local DB ---
router.post('/readings/fetch-and-save-external', authenticateToken, dataController.fetchAndSaveSensorReadings);


// --- Other Table Routes (These will call the Local MySQL DB via dataService) ---
// GET all farms
router.get('/farms', authenticateToken, dataController.getFarms);

// GET all plants
router.get('/plants', authenticateToken, dataController.getPlants);

// GET all sensors
router.get('/sensors', authenticateToken, dataController.getSensors);

// GET a specific sensor by ID
router.get('/sensors/:sensorId', authenticateToken, dataController.getSensorById);


module.exports = router;