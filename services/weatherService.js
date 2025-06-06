// services/weatherService.js
const axios = require('axios');

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

const getWeatherData = async (latitude, longitude) => {
    const timezone = 'Asia/Singapore'; // Or make this dynamic based on input

    // Open-Meteo API
    const openMeteoApiUrl = `${OPEN_METEO_BASE_URL}?` +
                             `latitude=${latitude}&longitude=${longitude}&` +
                             `hourly=surface_pressure,uv_index,temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m&` +
                             `timezone=${timezone}`;

    try {
        const response = await axios.get(openMeteoApiUrl);
        const data = response.data;

        // Find the current hour's index based on current time
        const now = new Date();
        const currentHourString = now.toISOString().slice(0, 13); // "YYYY-MM-DDTHH"
        const hourlyTimes = data.hourly.time || [];
        let currentIndex = hourlyTimes.findIndex(time => time.startsWith(currentHourString));

        if (currentIndex === -1 && hourlyTimes.length > 0) {
            // Fallback: If exact hour not found (e.g., API time slightly ahead/behind), use first available
            currentIndex = 0;
            console.warn("Current hour's data not perfectly aligned, using first hourly data point.");
        } else if (hourlyTimes.length === 0) {
            throw new Error("No hourly data available from Open-Meteo API.");
        }

        // Extract and format the specific data points you need
        const formattedWeatherData = {
            temperature: data.hourly.temperature_2m[currentIndex] !== undefined
                ? data.hourly.temperature_2m[currentIndex]
                : null,
            humidity: data.hourly.relative_humidity_2m[currentIndex] !== undefined
                ? data.hourly.relative_humidity_2m[currentIndex]
                : null,
            pressure: data.hourly.surface_pressure[currentIndex] !== undefined
                ? data.hourly.surface_pressure[currentIndex]
                : null,
            uvIndex: data.hourly.uv_index[currentIndex] !== undefined
                ? data.hourly.uv_index[currentIndex]
                : null,
            precipitationProbability: data.hourly.precipitation_probability[currentIndex] !== undefined
                ? data.hourly.precipitation_probability[currentIndex]
                : null,
            windSpeed: data.hourly.wind_speed_10m[currentIndex] !== undefined
                ? data.hourly.wind_speed_10m[currentIndex]
                : null,
        };

        return formattedWeatherData;

    } catch (error) {
        console.error("Error fetching weather data from Open-Meteo API:", error.message);
        if (error.response) {
            console.error("Open-Meteo API response status:", error.response.status);
            console.error("Open-Meteo API response data:", error.response.data);
        }
        throw new Error("Failed to retrieve weather data."); // Re-throw a generic error for controller to handle
    }
};

module.exports = {
    getWeatherData
};