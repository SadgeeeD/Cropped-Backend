require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require('https');

const app = express();
const port = process.env.PORT || 5000;

// Import Routes
const userRoutes = require('./routes/users');

// Middleware
app.use(cors());
app.use(express.json());

// Register Routes
app.use('/api', userRoutes); // This enables /api/login

// Root Route
app.get('/', (req, res) => {
  res.send('Node.js Backend is running!');
});

// Base URL from .env
const EXTERNAL_SENSOR_API_BASE_URL = process.env.EXTERNAL_SENSOR_API_BASE_URL;
if (!EXTERNAL_SENSOR_API_BASE_URL) {
  console.error('❌ EXTERNAL_SENSOR_API_BASE_URL is not defined in .env');
} else {
  console.log('✅ Using API Base URL:', EXTERNAL_SENSOR_API_BASE_URL);
}

const logAndSend = (res, data, routeName) => {
  console.log(`✅ [${routeName}] Successfully fetched ${Array.isArray(data) ? data.length : 'data'} items`);
  res.json(data);
};

// #region External SQL API
app.get('/api/getFarms', async (req, res) => {
  const url = `${EXTERNAL_SENSOR_API_BASE_URL}/Farms/GetAllFarms`;
  console.log('➡️  Requesting:', url);
  try {
    const response = await axios.get(url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    logAndSend(res, response.data, 'getFarms');
  } catch (error) {
    console.error('❌ [getFarms] Failed to fetch:', error.message);
    res.status(500).json({ error: 'Failed to fetch farms data' });
  }
});

app.get('/api/getSensorReadings', async (req, res) => {
  const url = `${EXTERNAL_SENSOR_API_BASE_URL}/SensorReadings/GetAllSensorReadings`;
  console.log('➡️  Requesting:', url);
  try {
    const response = await axios.get(url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    logAndSend(res, response.data, 'getSensorReadings');
  } catch (error) {
    console.error('❌ [getSensorReadings] Failed to fetch:', error.message);
    res.status(500).json({ error: 'Failed to fetch sensor readings data' });
  }
});

app.get('/api/getSensors', async (req, res) => {
  const url = `${EXTERNAL_SENSOR_API_BASE_URL}/Sensors/GetAllSensors`;
  console.log('➡️  Requesting:', url);
  try {
    const response = await axios.get(url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    logAndSend(res, response.data, 'getSensors');
  } catch (error) {
    console.error('❌ [getSensors] Failed to fetch:', error.message);
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

app.get('/api/getPlants', async (req, res) => {
  const url = `${EXTERNAL_SENSOR_API_BASE_URL}/Plants/GetAllPlants`;
  console.log('➡️  Requesting:', url);
  try {
    const response = await axios.get(url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    logAndSend(res, response.data, 'getPlants');
  } catch (error) {
    console.error('❌ [getPlants] Failed to fetch:', error.message);
    res.status(500).json({ error: 'Failed to fetch plants data' });
  }
});

app.get('/api/getAllPlantSpecies', async (req, res) => {
  const url = `${EXTERNAL_SENSOR_API_BASE_URL}/PlantSpecies/GetAllPlantSpecies`;
  console.log('➡️  Requesting:', url);
  try {
    const response = await axios.get(url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    logAndSend(res, response.data, 'getAllPlantSpecies');
  } catch (error) {
    console.error('❌ [getAllPlantSpecies] Failed to fetch:', error.message);
    res.status(500).json({ error: 'Failed to fetch plant species data' });
  }
});

app.get('/api/getUsers', async (req, res) => {
  const url = `${EXTERNAL_SENSOR_API_BASE_URL}/Users/GetAllUsers`;
  console.log('➡️  Requesting:', url);
  try {
    const response = await axios.get(url, { httpsAgent: new https.Agent({ rejectUnauthorized: false }) });
    logAndSend(res, response.data, 'getUsers');
  } catch (error) {
    console.error('❌ [getUsers] Failed to fetch:', error.message);
    res.status(500).json({ error: 'Failed to fetch users data' });
  }
});
// #endregion

// #region Weather API
const getWeatherData = async () => {
  const url = process.env.WEATHER_API_URL;
  console.log('➡️  Requesting weather:', url);
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather data');
  return await response.json();
};

app.get('/weather', async (req, res) => {
  try {
    const data = await getWeatherData();
    logAndSend(res, data, 'weather');
  } catch (err) {
    console.error('❌ [weather] Failed:', err.message);
    res.status(500).json({ error: 'Weather data fetch failed' });
  }
});
// #endregion

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
