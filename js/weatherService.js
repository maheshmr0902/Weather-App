// js/weatherService.js
const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Keep this secure in production!

async function getWeatherData(latitude, longitude) {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=metric&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("Invalid API key or API key not active.");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error; // Re-throw to be handled by calling function
    }
}

async function getCoordinates(query) {
    // Use OpenWeatherMap Geocoding for simplicity, but consider dedicated APIs for better results
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
             if (response.status === 401) {
                throw new Error("Invalid API key or API key not active.");
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: data[0].lat, lon: data[0].lon, name: data[0].name, country: data[0].country, state: data[0].state };
        } else {
            return null; // City not found
        }
    } catch (error) {
        console.error("Error fetching coordinates:", error);
        throw error;
    }
}

// Function to get reverse geocoded city name from coordinates
async function getCityNameFromCoords(lat, lon) {
    const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].name;
        } else {
            return "Unknown Location";
        }
    } catch (error) {
        console.error("Error in reverse geocoding:", error);
        return "Unknown Location";
    }
}

export { getWeatherData, getCoordinates, getCityNameFromCoords };