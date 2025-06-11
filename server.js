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


const EXTERNAL_SENSOR_API_BASE_URL = process.env.EXTERNAL_SENSOR_API_BASE_URL;

// Ensure the base URL for the external sensor API is set
if (!EXTERNAL_SENSOR_API_BASE_URL) {
    console.error('EXTERNAL_SENSOR_API_BASE_URL is not defined in .env');
    // Consider how to handle this critical error: exit, throw, or default.
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



// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access auth at http://localhost:${port}/api/auth`);
    console.log(`Access data at http://localhost:${port}/api/data`);
    console.log(`Access weather at http://localhost:${port}/api/weather`);
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));