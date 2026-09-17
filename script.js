const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const weatherInfoSection = document.querySelector(".weather-info");
const searchCitySection = document.querySelector(".search-city");
const notFoundSection = document.querySelector(".not-found");
const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValue = document.querySelector(".humidity-value-txt");
const windValue = document.querySelector(".wind-value-txt");
const weatherSummaryImg = document.querySelector(".weather-summary-img");
const currentDate = document.querySelector(".current-data-txt");
const forecastItemContainer = document.querySelector(".forecast-items-container");

// ========================================
// API KEY
// ========================================
const apiKey = "48ffc6262d9e39103165331932594cff";

// ========================================
// SEARCH TRIGGERS
// ========================================
searchBtn.addEventListener("click", () => {
    handleSearch();
});

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
});

function handleSearch() {
    const city = cityInput.value.trim();
    if (city === "") return;

    updateWeatherInfo(city);
    cityInput.value = "";
    cityInput.blur(); // Closes on-screen keyboard on mobile
}

// ========================================
// GET API DATA
// ========================================
async function getFetchData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
}

// ========================================
// WEATHER ICON MAPPING
// ========================================
function getWeatherIcon(id) {
    if (id >= 200 && id <= 232) return "thunderstorm.svg";
    if (id >= 300 && id <= 321) return "drizzle.svg";
    if (id >= 500 && id <= 531) return "rain.svg";
    if (id >= 600 && id <= 622) return "snow.svg";
    if (id >= 701 && id <= 781) return "atmosphere.svg";
    if (id === 800) return "clear.svg";
    return "clouds.svg";
}

// ========================================
// CURRENT DATE FORMATTING
// ========================================
function getCurrentDate() {
    const date = new Date();
    const options = {
        weekday: "short",
        day: "2-digit",
        month: "short"
    };
    return date.toLocaleDateString("en-GB", options);
}

// ========================================
// UPDATE CURRENT WEATHER
// ========================================
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData("weather", city);

    if (!weatherData) return;

    // Invalid API key
    if (weatherData.cod === 401) {
        alert("Invalid API Key:\n\n" + weatherData.message);
        return;
    }

    // City not found
    if (weatherData.cod === 404 || weatherData.cod === "404") {
        showDisplaySection(notFoundSection);
        return;
    }

    if (weatherData.cod !== 200) {
        alert(weatherData.message);
        return;
    }

    const {
        name,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData;

    countryTxt.textContent = name;
    tempTxt.textContent = `${Math.round(temp)} °C`;
    conditionTxt.textContent = main;
    humidityValue.textContent = `${humidity}%`;
    windValue.textContent = `${speed} m/s`;
    currentDate.textContent = getCurrentDate();
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;

    // Update 5-day forecast
    await updateForecastsInfo(city);

    // Show the weather section
    showDisplaySection(weatherInfoSection);
}

// ========================================
// FORECAST DATA
// ========================================
async function updateForecastsInfo(city) {
    const forecastData = await getFetchData("forecast", city);

    forecastItemContainer.innerHTML = "";

    if (!forecastData || (forecastData.cod !== 200 && forecastData.cod !== "200")) {
        return;
    }

    const todayDate = new Date().toISOString().split("T")[0];

    forecastData.list.forEach((forecastWeather) => {
        const dateTime = forecastWeather.dt_txt;

        // OpenWeatherMap gives 3-hour forecasts; picking 12:00:00 PM gives one forecast per day
        if (dateTime.includes("12:00:00") && !dateTime.includes(todayDate)) {
            updateForecastItem(forecastWeather);
        }
    });
}

// ========================================
// FORECAST ITEM CREATION
// ========================================
function updateForecastItem(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    const dateTaken = new Date(date);
    const dateOptions = {
        day: "2-digit",
        month: "short"
    };
    const dateResult = dateTaken.toLocaleDateString("en-GB", dateOptions);

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date">${dateResult}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" alt="Weather" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;

    forecastItemContainer.insertAdjacentHTML("beforeend", forecastItem);
}

// ========================================
// SECTION DISPLAY CONTROLLER
// ========================================
function showDisplaySection(section) {
    weatherInfoSection.style.display = "none";
    searchCitySection.style.display = "none";
    notFoundSection.style.display = "none";

    section.style.display = "flex";
}

// Start with the initial search screen visible
showDisplaySection(searchCitySection);