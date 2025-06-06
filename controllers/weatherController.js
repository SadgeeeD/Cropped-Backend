// controllers/weatherController.js
const weatherService = require('../services/weatherService');

const getLiveWeatherData = async (req, res) => {
    // You can pass lat/lon from frontend query params or use defaults
    const latitude = req.query.lat || 1.3521; // Default to Singapore
    const longitude = req.query.lon || 103.8198; // Default to Singapore

    try {
        const data = await weatherService.getWeatherData(latitude, longitude);

        // Format units and descriptions for frontend display
        const formattedData = {
            temperature: data.temperature !== null ? `${data.temperature}°C` : 'N/A',
            humidity: data.humidity !== null ? `${data.humidity}%` : 'N/A',
            pressure: data.pressure !== null ? `${data.pressure} hPa` : 'N/A',
            uvIndex: data.uvIndex !== null ? `${data.uvIndex}` : 'N/A', // UV Index is dimensionless
            precipitationProbability: data.precipitationProbability !== null ? `${data.precipitationProbability}%` : 'N/A',
            windSpeed: data.windSpeed !== null ? `${data.windSpeed} km/h` : 'N/A',
            // You might add a 'light' field here, combining UV index and/or a real light sensor
            // light: 'N/A' // Placeholder
        };

        res.json(formattedData);
    } catch (error) {
        console.error('Error in weatherController:', error.message);
        res.status(500).json({ message: 'Failed to retrieve weather data.' });
    }
};

module.exports = {
    getLiveWeatherData
};