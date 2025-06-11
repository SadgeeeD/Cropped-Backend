// server.js
require('dotenv').config(); // Load environment variables first
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import cors
const app = express();
const port = process.env.PORT || 5000;

// Import routes
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const weatherRoutes = require('./routes/weatherRoutes');

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // For parsing application/json data

// Route Middlewares
app.use('/api/auth', authRoutes); // e.g., /api/auth/register, /api/auth/login
app.use('/api/data', dataRoutes); // e.g., /api/data/products
app.use('/api/weather', weatherRoutes); // e.g., /api/weather?lat=...&lon=...

// Basic root route
app.get('/', (req, res) => {
    res.send('Node.js Backend is running!');
});

const https = require('https'); // add this at the top

// #region SQL Data
const EXTERNAL_SENSOR_API_BASE_URL = process.env.EXTERNAL_SENSOR_API_BASE_URL;

if (!EXTERNAL_SENSOR_API_BASE_URL) {
    console.error('EXTERNAL_SENSOR_API_BASE_URL is not defined in .env');
}

app.get('/api/getFarms', async (req, res) => {
  try {
    const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/Farms/GetAllFarms`, {  
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // <- bypass SSL cert errors
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching farms:", error);
    res.status(500).json({ error: 'Failed to fetch farms data' });
  }
});

app.get('/api/getSensorReadings', async (req, res) => {
  try {
    const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/SensorReadings/GetAllSensorReadings`, {  
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // <- bypass SSL cert errors
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ error: 'Failed to fetch sensor readings data' });
  }
});

app.get('/api/getSensors', async (req, res) => {
  try {
    const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/Sensors/GetAllSensors`, {  
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // <- bypass SSL cert errors
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ error: 'Failed to fetch sensor data' });
  }
});

app.get('/api/getPlants', async (req, res) => {
  try {
    const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/Plants/GetAllPlants`, {  
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // <- bypass SSL cert errors
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ error: 'Failed to fetch plants data' });
  }
});

app.get('/api/getAllPlantSpecies', async (req, res) => {
  try {
    const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/PlantSpecies/GetAllPlantSpecies`, {  
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // <- bypass SSL cert errors
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ error: 'Failed to fetch plant species data' });
  }
});

app.get('/api/getUsers', async (req, res) => {
  try {
    const response = await axios.get(`${EXTERNAL_SENSOR_API_BASE_URL}/Users/GetAllUsers`, {  
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) // <- bypass SSL cert errors
    });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ error: 'Failed to fetch users data' });
  }
});
// #endregion

// #region Weather API
const getWeatherData = async () => {
  const url = process.env.WEATHER_API_URL;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch weather data');
  return await response.json();
}

app.get('/weather', async (req, res) => {
  try {
      const data = await getWeatherData();
      res.json(data);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Weather data fetch failed' });
  }
});
// #endregion

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access auth at http://localhost:${port}/api/auth`);
    console.log(`Access data at http://localhost:${port}/api/data`);
    console.log(`Access weather at http://localhost:${port}/api/weather`);
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));