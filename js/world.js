// js/world.js
import { getCoordinates, getWeatherData, getWeatherIcon } from './weatherService.js';

let searchinput = document.querySelector(".searchinput");
let normalMessage = document.querySelector(".normal-message");
let errorMessage = document.querySelector(".error-message");
let addedMessage = document.querySelector(".added-message");
let cityBoxContainer = document.querySelector(".city-box"); // Renamed for clarity
let noCitiesMessage = document.querySelector(".no-cities-message");

// Display current date
const dateElement = document.getElementById("current-date");
const today = new Date();
const months_name = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
dateElement.innerHTML = `${months_name[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

// Local Storage functions
function getSavedCities() {
    try {
        const cities = localStorage.getItem('savedCities');
        return cities ? JSON.parse(cities) : [];
    } catch (e) {
        console.error("Error parsing saved cities from localStorage:", e);
        return [];
    }
}

function saveCities(cities) {
    try {
        localStorage.setItem('savedCities', JSON.stringify(cities));
    } catch (e) {
        console.error("Error saving cities to localStorage:", e);
    }
}

// Function to render a single city card
async function renderCityCard(cityData) {
    try {
        const weatherData = await getWeatherData(cityData.lat, cityData.lon);
        const currentTemp = Math.floor(weatherData.current.temp);
        const weatherDesc = weatherData.current.weather[0].description;
        const iconSrc = getWeatherIcon(weatherData.current.weather[0].main);
        const locationDisplayName = `${cityData.name}${cityData.state ? ', ' + cityData.state : ''}`;

        const cardHtml = `
            <div class="box city-card" data-city-name="${cityData.name}" data-lat="${cityData.lat}" data-lon="${cityData.lon}">
                <div class="weather-box">
                    <div class="name">
                        <div class="city-name">${locationDisplayName}</div>
                        <div class="weather-temp">${currentTemp}°</div>
                    </div>
                    <div class="weather-icon">
                        <img class="weather-img" src="${iconSrc}" alt="${weatherDesc}">
                    </div>
                </div>
                <div class="weather-desc">
                    <div class="desc-box">
                        <div class="desc-name">${weatherDesc}</div>
                    </div>
                    <div class="remove-city" data-city-name="${cityData.name}" title="Remove City">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                </div>
            </div>
        `;
        cityBoxContainer.insertAdjacentHTML('beforeend', cardHtml); // Append the new card

        // Add event listener for remove button
        const newCard = cityBoxContainer.querySelector(`.city-card[data-city-name="${cityData.name}"][data-lat="${cityData.lat}"][data-lon="${cityData.lon}"]`);
        if (newCard) {
            newCard.querySelector('.remove-city').addEventListener('click', (event) => {
                const cityToRemoveName = event.currentTarget.dataset.cityName;
                const cityToRemoveLat = event.currentTarget.closest('.city-card').dataset.lat;
                const cityToRemoveLon = event.currentTarget.closest('.city-card').dataset.lon;
                removeCity(cityToRemoveName, cityToRemoveLat, cityToRemoveLon);
            });
        }


    } catch (error) {
        console.error(`Error rendering weather for ${cityData.name}:`, error);
        // Display an error card or fallback
        const locationDisplayName = `${cityData.name}${cityData.state ? ', ' + cityData.state : ''}`;
        const errorCardHtml = `
            <div class="box city-card" data-city-name="${cityData.name}" data-lat="${cityData.lat}" data-lon="${cityData.lon}">
                <div class="weather-box">
                    <div class="name">
                        <div class="city-name">${locationDisplayName}</div>
                        <div class="weather-temp">N/A</div>
                    </div>
                    <div class="weather-icon">
                        <img class="weather-img" src="img/cloud.png" alt="Error Icon">
                    </div>
                </div>
                <div class="weather-desc">
                    <div class="desc-box">
                        <div class="desc-name">Error Loading</div>
                    </div>
                    <div class="remove-city" data-city-name="${cityData.name}" data-lat="${cityData.lat}" data-lon="${cityData.lon}" title="Remove City">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                </div>
            </div>
        `;
        cityBoxContainer.insertAdjacentHTML('beforeend', errorCardHtml);

        const newCard = cityBoxContainer.querySelector(`.city-card[data-city-name="${cityData.name}"][data-lat="${cityData.lat}"][data-lon="${cityData.lon}"]`);
        if (newCard) {
            newCard.querySelector('.remove-city').addEventListener('click', (event) => {
                const cityToRemoveName = event.currentTarget.dataset.cityName;
                const cityToRemoveLat = event.currentTarget.closest('.city-card').dataset.lat;
                const cityToRemoveLon = event.currentTarget.closest('.city-card').dataset.lon;
                removeCity(cityToRemoveName, cityToRemoveLat, cityToRemoveLon);
            });
        }
    } finally {
        updateNoCitiesMessageVisibility();
    }
}

// Function to remove a city
function removeCity(cityName, lat, lon) {
    let savedCities = getSavedCities();
    // Filter by name, latitude, and longitude to handle cities with the same name but different locations
    savedCities = savedCities.filter(city => !(city.name === cityName && city.lat === parseFloat(lat) && city.lon === parseFloat(lon)));
    saveCities(savedCities);
    document.querySelector(`.city-card[data-city-name="${cityName}"][data-lat="${lat}"][data-lon="${lon}"]`).remove();
    updateNoCitiesMessageVisibility();
}

// Function to load and display all saved cities
async function loadAndDisplaySavedCities() {
    cityBoxContainer.innerHTML = ''; // Clear existing content
    const savedCities = getSavedCities();
    if (savedCities.length === 0) {
        normalMessage.style.display = "block";
        noCitiesMessage.style.display = "block";
    } else {
        noCitiesMessage.style.display = "none";
        for (const cityData of savedCities) {
            await renderCityCard(cityData); // Use await to ensure sequential rendering
        }
    }
}

// Update visibility of "No cities added yet" message
function updateNoCitiesMessageVisibility() {
    const savedCities = getSavedCities();
    if (savedCities.length === 0) {
        noCitiesMessage.style.display = "block";
    } else {
        noCitiesMessage.style.display = "none";
    }
}


// Add section toggle
let section = document.querySelector(".add-section");
let navBtn = document.querySelector(".button");
let navIcon = document.querySelector(".btn-icon");

navBtn.addEventListener("click", () => {
    if (section.style.top === "100px") {
        section.style.top = "-60rem";
        navIcon.className = "fa-solid fa-circle-plus btn-icon";
    } else {
        section.style.top = "100px";
        navIcon.className = "fa-solid fa-circle-xmark btn-icon";
    }
    // Reset messages when opening/closing
    normalMessage.style.display = "block";
    errorMessage.style.display = "none";
    addedMessage.style.display = "none";
    searchinput.value = '';
});

// Search input for adding new cities
searchinput.addEventListener("keydown", async function (event) {
    if (event.keyCode === 13 || event.which === 13) {
        const query = searchinput.value.trim();
        if (!query) {
            normalMessage.style.display = "block";
            errorMessage.style.display = "none";
            addedMessage.style.display = "none";
            return;
        }

        normalMessage.style.display = "none";
        errorMessage.style.display = "none";
        addedMessage.style.display = "none";

        try {
            const locationData = await getCoordinates(query);
            if (locationData) {
                let savedCities = getSavedCities();
                // Check if city already exists (by lat/lon for uniqueness)
                const isDuplicate = savedCities.some(city =>
                    city.lat === locationData.lat && city.lon === locationData.lon
                );

                if (!isDuplicate) {
                    savedCities.push({
                        name: locationData.name,
                        lat: locationData.lat,
                        lon: locationData.lon,
                        country: locationData.country,
                        state: locationData.state
                    });
                    saveCities(savedCities);
                    await renderCityCard(locationData); // Render the new card immediately
                    addedMessage.style.display = "block";
                    searchinput.value = ''; // Clear input
                } else {
                    errorMessage.innerHTML = "City already added!";
                    errorMessage.style.display = "block";
                }
            } else {
                errorMessage.innerHTML = "City not found. Please try again.";
                errorMessage.style.display = "block";
            }
        } catch (error) {
            console.error("Error adding city:", error);
            errorMessage.innerHTML = "An error occurred. Please try again. " + error.message;
            errorMessage.style.display = "block";
        }
    }
});

// Load cities when the page loads
loadAndDisplaySavedCities();