// services/dataService.js
const pool = require('../config/db'); // For local MySQL database operations
const axios = require('axios');       // For external Sensor Readings API

require('dotenv').config(); // Load environment variables

const EXTERNAL_SENSOR_API_BASE_URL = process.env.EXTERNAL_SENSOR_API_BASE_URL;

// Ensure the base URL for the external sensor API is set
if (!EXTERNAL_SENSOR_API_BASE_URL) {
    console.error('EXTERNAL_SENSOR_API_BASE_URL is not defined in .env');
    // Consider how to handle this critical error: exit, throw, or default.
}

// --- SensorReadings Operations (FROM EXTERNAL API) ---

// Get all sensor readings from the external API
const getAllSensorReadings = async () => {
    try {
        const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/sensorReadings`);
        return response.data; // The data returned by the external API
    } catch (error) {
        console.error('Error fetching all sensor readings from external API:', error.message);
        if (error.response) {
            console.error('External Sensor API response error:', error.response.data);
            throw new Error(error.response.data.message || 'Failed to fetch sensor readings from external API.');
        } else if (error.request) {
            console.error('No response received from external Sensor API:', error.request);
            throw new Error('No response from external Sensor API. Is it running?');
        } else {
            console.error('Error setting up request to external Sensor API:', error.message);
            throw new Error('Error making request to external Sensor API.');
        }
    }
};

// Get sensor readings by SensorId from the external API
const getSensorReadingsBySensorId = async (sensorId) => {
    try {
        const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/sensorReadings/sensor/${sensorId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching sensor readings for SensorId ${sensorId} from external API:`, error.message);
        if (error.response && error.response.status === 404) {
            return []; // Return empty array if not found, consistent with DB query
        }
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch sensor readings by sensor ID from external API.');
        } else {
            throw new Error('Error making request to external Sensor API.');
        }
    }
};

// Get the latest reading for a specific SensorId from the external API
const getLatestReadingBySensorId = async (sensorId) => {
    try {
        const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/sensorReadings/latest/${sensorId}`);
        return response.data; // Should be a single object or null/empty from external API
    } catch (error) {
        console.error(`Error fetching latest reading for SensorId ${sensorId} from external API:`, error.message);
        if (error.response && error.response.status === 404) {
            return null; // Return null if not found
        }
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch latest sensor reading from external API.');
        } else {
            throw new Error('Error making request to external Sensor API.');
        }
    }
};

// Get all sensor readings for a specific PlantId from the external API
// Note: This assumes the external API has an endpoint to query by PlantId
const getSensorReadingsByPlantId = async (plantId) => {
    try {
        const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/sensorReadings/plant/${plantId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching sensor readings for PlantId ${plantId} from external API:`, error.message);
        if (error.response && error.response.status === 404) {
            return [];
        }
        if (error.response) {
            throw new Error(error.response.data.message || 'Failed to fetch sensor readings by plant ID from external API.');
        } else {
            throw new Error('Error making request to external Sensor API.');
        }
    }
};

// Add a new sensor reading to the external API
const createSensorReading = async (readingData) => { // Expects an object matching external API's requirement
    try {
        const response = await axios.post(`${EXTERNAL_SENSOR_API_BASE_URL}/sensorReadings`, readingData);
        return response.data; // Return response from external API (e.g., ID of new reading)
    } catch (error) {
        console.error('Error creating sensor reading via external API:', error.message);
        if (error.response) {
            console.error('External Sensor API response error:', error.response.data);
            throw new Error(error.response.data.message || 'Failed to create sensor reading via external API.');
        } else {
            throw new Error('Error making request to external Sensor API.');
        }
    }
};

// --- Other Data Operations (FROM LOCAL MYSQL DB) ---

// Get all Farms 
const getAllFarms = async () => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Farms');
        return rows;
    } catch (error) {
        console.error('Error fetching all farms from local DB:', error);
        throw new Error('Failed to fetch farms from database.');
    }
};

// Get all Plants with Species Name 
const getAllPlants = async () => {
    try {
        const [rows] = await pool.execute(
            'SELECT p.*, ps.SpeciesName, f.Name AS FarmName ' +
            'FROM Plants p ' +
            'JOIN PlantSpeciesLookup ps ON p.SpeciesId = ps.SpeciesId ' +
            'JOIN Farms f ON p.FarmId = f.FarmId'
        );
        return rows;
    } catch (error) {
        console.error('Error fetching all plants from local DB:', error);
        throw new Error('Failed to fetch plants from database.');
    }
};

// Get all Sensors 
const getAllSensors = async () => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Sensors');
        return rows;
    } catch (error) {
        console.error('Error fetching all sensors from local DB:', error);
        throw new Error('Failed to fetch sensors from database.');
    }
};

// Get a specific Sensor by ID 
const getSensorById = async (sensorId) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Sensors WHERE SensorId = ?', [sensorId]);
        return rows[0];
    } catch (error) {
        console.error(`Error fetching sensor with ID ${sensorId} from local DB:`, error);
        throw new Error('Failed to fetch sensor by ID from database.');
    }
};


// --- NEW: Fetch from external API and save to local DB ---
const fetchAndSaveExternalSensorReadings = async () => {
    try {
        const externalReadings = await getAllSensorReadings(); // Get data from external API

        let savedCount = 0;
        let failedCount = 0;

        for (const reading of externalReadings) {
            try {
                await insertSensorReadingIntoLocalDB(reading);
                savedCount++;
            } catch (insertError) {
                console.warn(`Could not save one reading to local DB: ${insertError.message}`);
                failedCount++;
            }
        }
        return { totalFetched: externalReadings.length, savedCount, failedCount };

    } catch (error) {
        console.error('Error in fetchAndSaveExternalSensorReadings:', error.message);
        throw error; // Re-throw the original error from fetching
    }
};

module.exports = {
    // SensorReadings from External API
    getAllSensorReadings,
    getSensorReadingsBySensorId,
    getLatestReadingBySensorId,
    getSensorReadingsByPlantId,
    createSensorReading,

    // Other Tables from Local MySQL DB
    getAllFarms,
    getAllPlants,
    getAllSensors,
    getSensorById,

    //Saving SQL data into local db
    fetchAndSaveExternalSensorReadings
};