// controllers/dataController.js
const dataService = require('../services/dataService');

// --- SensorReadings Controller Functions (FROM EXTERNAL API) ---

const getSensorReadings = async (req, res) => {
    try {
        const readings = await dataService.getAllSensorReadings();
        res.json(readings);
    } catch (error) {
        console.error('Error in getSensorReadings controller:', error.message);
        res.status(500).json({ message: error.message || 'Server error fetching sensor readings.' });
    }
};

const getSensorReadingsBySensorId = async (req, res) => {
    const sensorId = req.params.sensorId;
    try {
        const readings = await dataService.getSensorReadingsBySensorId(sensorId);
        if (readings.length === 0) { // Assuming external API returns empty array for no readings
            return res.status(404).json({ message: `No readings found for sensor ID ${sensorId}.` });
        }
        res.json(readings);
    } catch (error) {
        console.error(`Error in getSensorReadingsBySensorId controller for ID ${sensorId}:`, error.message);
        res.status(500).json({ message: error.message || 'Server error fetching sensor readings by sensor ID.' });
    }
};

const getLatestSensorReadingBySensorId = async (req, res) => {
    const sensorId = req.params.sensorId;
    try {
        const reading = await dataService.getLatestReadingBySensorId(sensorId);
        if (!reading) { // Assuming external API returns null/empty for no latest reading
            return res.status(404).json({ message: `No latest reading found for sensor ID ${sensorId}.` });
        }
        res.json(reading);
    } catch (error) {
        console.error(`Error in getLatestSensorReadingBySensorId controller for ID ${sensorId}:`, error.message);
        res.status(500).json({ message: error.message || 'Server error fetching latest sensor reading.' });
    }
};

const getSensorReadingsByPlantId = async (req, res) => {
    const plantId = req.params.plantId;
    try {
        const readings = await dataService.getSensorReadingsByPlantId(plantId);
        if (readings.length === 0) {
            return res.status(404).json({ message: `No readings found for plant ID ${plantId}.` });
        }
        res.json(readings);
    } catch (error) {
        console.error(`Error in getSensorReadingsByPlantId controller for ID ${plantId}:`, error.message);
        res.status(500).json({ message: error.message || 'Server error fetching sensor readings by plant ID.' });
    }
};

const createSensorReading = async (req, res) => {
    const readingData = req.body; // Pass the entire body object to the service
    // Add basic validation for required fields if needed
    if (!readingData || !readingData.SensorId || readingData.Value === undefined || !readingData.Unit) {
        return res.status(400).json({ message: 'SensorId, Value, and Unit are required for a new reading.' });
    }

    try {
        const responseFromExternalApi = await dataService.createSensorReading(readingData);
        res.status(201).json({
            message: 'Sensor reading created successfully via external API!',
            data: responseFromExternalApi // Return whatever the external API sent back
        });
    } catch (error) {
        console.error('Error in createSensorReading controller:', error.message);
        res.status(500).json({ message: error.message || 'Server error creating sensor reading.' });
    }
};

// --- HELPER FUNCTION: Insert/Save a single sensor reading to local MySQL DB ---
const insertSensorReadingIntoLocalDB = async (reading) => {
    try {
        let timestamp = reading.Timestamp;
        if (timestamp) {
            const date = new Date(timestamp);
            if (!isNaN(date.getTime())) { // Check if valid date
                timestamp = date.toISOString().slice(0, 19).replace('T', ' ');
            } else {
                timestamp = null; // Or handle invalid timestamp as needed
            }
        } else {
            timestamp = null; // No timestamp provided
        }

        // Assuming SensorReadings table columns are:
        // ReadingId (AUTO_INCREMENT), SensorId, Value, Unit, Timestamp, PlantId
        const [result] = await pool.execute(
            'INSERT INTO SensorReadings (SensorId, Value, Unit, Timestamp, PlantId) VALUES (?, ?, ?, ?, ?)',
            [reading.SensorId, reading.Value, reading.Unit, timestamp, reading.PlantId || null]
        );
        return result.insertId;
    } catch (error) {
        console.error(`Error inserting sensor reading into local DB (SensorId: ${reading.SensorId}, Value: ${reading.Value}):`, error.message);
        throw new Error('Failed to insert sensor reading into local database.');
    }
};

// --- NEW: Controller to trigger fetching from external API and saving to local DB ---
const fetchAndSaveSensorReadings = async (req, res) => {
    try {
        const result = await dataService.fetchAndSaveExternalSensorReadings();
        res.status(200).json({
            message: 'External sensor readings fetched and saved to local DB successfully!',
            summary: result
        });
    } catch (error) {
        console.error('Error in fetchAndSaveSensorReadings controller:', error.message);
        res.status(500).json({ message: error.message || 'Server error during fetch and save operation.' });
    }
};


// --- Other Data Controller Functions (Farms, Plants, Sensors from Local DB) ---

const getFarms = async (req, res) => {
    try {
        const farms = await dataService.getAllFarms();
        res.json(farms);
    } catch (error) {
        console.error('Error in getFarms controller:', error.message);
        res.status(500).json({ message: error.message || 'Server error fetching farms.' });
    }
};

const getPlants = async (req, res) => {
    try {
        const plants = await dataService.getAllPlants();
        res.json(plants);
    } catch (error) {
        console.error('Error in getPlants controller:', error.message);
        res.status(500).json({ message: error.message || 'Server error fetching plants.' });
    }
};

const getSensors = async (req, res) => {
    try {
        const sensors = await dataService.getAllSensors();
        res.json(sensors);
    } catch (error) {
        console.error('Error in getSensors controller:', error.message);
        res.status(500).json({ message: error.message || 'Server error fetching sensors.' });
    }
};

const getSensorById = async (req, res) => {
    const sensorId = req.params.sensorId;
    try {
        const sensor = await dataService.getSensorById(sensorId);
        if (!sensor) {
            return res.status(404).json({ message: `Sensor with ID ${sensorId} not found.` });
        }
        res.json(sensor);
    } catch (error) {
        console.error(`Error in getSensorById controller for ID ${sensorId}:`, error.message);
        res.status(500).json({ message: error.message || 'Server error fetching sensor by ID.' });
    }
};

module.exports = {
    // SensorReadings from External API
    getSensorReadings,
    getSensorReadingsBySensorId,
    getLatestSensorReadingBySensorId,
    getSensorReadingsByPlantId,
    createSensorReading,

    // NEW: Controller for fetching from external and saving to local
    fetchAndSaveSensorReadings,

    // Other Tables from Local MySQL DB
    getFarms,
    getPlants,
    getSensors,
    getSensorById,
};