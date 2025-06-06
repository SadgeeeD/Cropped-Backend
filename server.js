// server.js
require('dotenv').config(); // Load environment variables first
const express = require('express');
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

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access auth at http://localhost:${port}/api/auth`);
    console.log(`Access data at http://localhost:${port}/api/data`);
    console.log(`Access weather at http://localhost:${port}/api/weather`);
});