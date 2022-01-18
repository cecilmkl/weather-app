function formatDate(date, updated = false) {
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let day = days[date.getDay()];
  let month = months[date.getMonth()];
  let dayOfMonth = date.getDate();
  let year = date.getFullYear();

  // Formatting to get two digit time
  let hour = date.getHours();
  let minutes = date.getMinutes();
  hour = ("0" + hour).slice(-2);
  minutes = ("0" + minutes).slice(-2);

  if (updated == true) {
    // if the date is for when the data was updated
    document.querySelector(
      "#last-updated"
    ).innerHTML = `${day} ${hour}:${minutes}`;
  } else {
    // if the date is the local time
    let dayTime = document.querySelector("#today-day-time");
    dayTime.innerHTML = `${day} ${hour}:${minutes}`;

    document.querySelector(
      "#today-date"
    ).innerHTML = `${month} ${dayOfMonth}, ${year}`;
  }
}

// Weather API
function updateWeather(response) {
  let weatherData = response.data;
  // Update cityname
  document.querySelector("#cityname").innerHTML = weatherData.name;
  // Update temperature
  celsiusTemperature = weatherData.main.temp;
  document.querySelector("#current-temp").innerHTML =
    Math.round(celsiusTemperature);
  document.querySelector("#celsius").classList.add("chosenDegree");
  document.querySelector("#fahrenheit").classList.remove("chosenDegree");

  // Weather details:
  //let feelsLike = Math.round(weatherData.main.feels_like);
  feelsLikeCelsius = Math.round(weatherData.main.feels_like);
  document.querySelector("#feels-like").innerHTML = `${feelsLikeCelsius} °C`;
  // Temperature range:
  minTempCelsius = Math.round(weatherData.main.temp_min);
  maxTempCelsius = Math.round(weatherData.main.temp_max);
  document.querySelector(
    "#temp-range"
  ).innerHTML = `[${minTempCelsius}, ${maxTempCelsius}] °C`;

  windSpeedMetric = Math.round(weatherData.wind.speed);
  document.querySelector("#wind").innerHTML = `${windSpeedMetric} m/s`; // change units elsewhere?

  let humidity = Math.round(weatherData.main.humidity);
  document.querySelector("#humidity").innerHTML = `${humidity} %`;

  document.querySelector("#weather-description").innerHTML =
    weatherData.weather[0].main;

  // Precipitation only appears when it is raining
  let precipitation = document.querySelector("#precipitation");
  if (weatherData.hasOwnProperty("rain")) {
    precipitation.innerHTML = `${weatherData.rain["1h"]} mm`;
  } else {
    precipitation.innerHTML = "-";
  }

  // update todays icon
  let iconCode = response.data.weather[0].icon;
  let description = response.data.weather[0].description;
  let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  document.querySelector("#icon").setAttribute("src", iconUrl);
  document.querySelector("#icon").setAttribute("alt", description);
  formatDate(new Date(response.data.dt * 1000), true);
}

function searchCity(city) {
  let apiKey = "f82fa348ac5be4c0a63ee7d2f60d4443";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  axios.get(apiUrl).then(updateWeather);

  formatDate(new Date()); // update date
}

function handleSubmit(event) {
  event.preventDefault();
  let cityInput = document.querySelector("#city-input").value.trim();
  searchCity(cityInput);
}

function searchCurrentLocation(position) {
  let longitude = position.coords.longitude;
  let latitude = position.coords.latitude;
  let apiKey = "f82fa348ac5be4c0a63ee7d2f60d4443";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
  axios.get(apiUrl).then(updateWeather);
  formatDate(new Date());
}

// Forecast
function displayForecast() {
  let forecastElement = document.querySelector("#forecast");
  let forecastHTML = `<ul
                class="list-group list-group-flush text-center"
                id="forecast"
              >`;
  let days = ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"];
  days.forEach(function (day) {
    forecastHTML += `<li class="list-group-item border-bottom-0 p-0">
                  <div class="card my-1">
                    <div class="card-body">
                      <div class="other-day">${day}</div>
                      <span class="other-emoji">🌤</span>
                      <span class="other-temp">
                        <span class="higher-limit"> 5</span>
                        <span class="lower-limit">| 2 </span>
                        °C
                      </span>
                    </div>
                  </div>
                </li>`;
  });

  forecastElement.innerHTML = forecastHTML + "</ul>";
}

// Celsius to Fahrenheit:
function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

// Metric <-> Imperial:
function changeUnits(event) {
  event.preventDefault();
  let todayTemp = document.querySelector("#current-temp");

  let clickedDegree = event.target.id;
  let fahrSymbol = document.querySelector("#fahrenheit");
  let celsiusSymbol = document.querySelector("#celsius");
  if (clickedDegree === "celsius") {
    todayTemp.innerHTML = Math.round(celsiusTemperature);
    celsiusSymbol.classList.add("chosenDegree");
    fahrSymbol.classList.remove("chosenDegree");
    document.querySelector("#feels-like").innerHTML = `${feelsLikeCelsius} °C`;
    document.querySelector(
      "#temp-range"
    ).innerHTML = `[${minTempCelsius}, ${maxTempCelsius}] °C`;
    document.querySelector("#wind").innerHTML = `${windSpeedMetric} m/s`;
  } else if (clickedDegree === "fahrenheit") {
    todayTemp.innerHTML = celsiusToFahrenheit(celsiusTemperature); // assuming whats there is in C deg!!
    fahrSymbol.classList.add("chosenDegree");
    celsiusSymbol.classList.remove("chosenDegree");
    document.querySelector("#feels-like").innerHTML = `${celsiusToFahrenheit(
      feelsLikeCelsius
    )} °F`;
    document.querySelector("#temp-range").innerHTML = `[${celsiusToFahrenheit(
      minTempCelsius
    )}, ${celsiusToFahrenheit(maxTempCelsius)}] °F`;

    // Change wind speed to imperial units:
    let windSpeedImperial = Math.round(windSpeedMetric * 2.237);
    document.querySelector("#wind").innerHTML = `${windSpeedImperial} mph`;
  } else {
    // Do nothing
  }
}

searchCity("London"); // when the page is loaded

// Search for city button
let cityForm = document.querySelector("#city-form");
cityForm.addEventListener("submit", handleSubmit);

// Current button
let currentButton = document.querySelector("#current-button");
currentButton.addEventListener("click", function (event) {
  navigator.geolocation.getCurrentPosition(searchCurrentLocation);
});

// F and C buttons

let celsiusTemperature = null;
let feelsLikeCelsius = null;
let minTempCelsius = null;
let maxTempCelsius = null;
let windSpeedMetric = null;

let celsiusLink = document.querySelector("#celsius");
celsiusLink.addEventListener("click", changeUnits);

let fahrenheitLink = document.querySelector("#fahrenheit");
fahrenheitLink.addEventListener("click", changeUnits);

displayForecast();
