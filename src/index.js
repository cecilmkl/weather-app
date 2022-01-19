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

function formatDay(timestamp) {
  let date = new Date(timestamp * 1000);
  let day = date.getDay();
  let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[day];
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
  let iconUrl = `img/${iconCode}.png`;
  document.querySelector("#icon").setAttribute("src", iconUrl);
  document.querySelector("#icon").setAttribute("alt", description);

  formatDate(new Date(new Date() - 3.6e6 + response.data.timezone * 1000));
  formatDate(new Date(response.data.dt * 1000), true);
  getForecast(response.data.coord);
}

function searchCity(city) {
  let apiKey = "f82fa348ac5be4c0a63ee7d2f60d4443";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  axios.get(apiUrl).then(updateWeather);
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
  //formatDate(new Date());
}

// Forecast
function displayForecast(response) {
  let forecast = response.data.daily;
  let forecastElement = document.querySelector("#forecast");
  let forecastHTML = `<ul
                class="list-group list-group-flush text-center"
                id="forecast"
              >`;
  forecast.forEach(function (forecastDay, index) {
    if (index == 0 || index > 6) {
      // Only interested in displaying the next 6 days
      return;
    }
    let iconCode = forecastDay.weather[0].icon;
    let description = forecastDay.weather[0].description;
    let tempMax = Math.round(forecastDay.temp.max);
    let tempMin = Math.round(forecastDay.temp.min);
    let day = formatDay(forecastDay.dt);
    // changing vertical spacing
    let vertical_spacing = "";
    if (index == 1) {
      vertical_spacing = "mb-1";
    } else if (index == 6) {
      vertical_spacing = "mt-1";
    } else {
      vertical_spacing = "my-1";
    }
    console.log(index);

    forecastHTML += `<li class="list-group-item border-bottom-0 p-0">
                  <div class="card ${vertical_spacing}">
                    <div class="card-body">
                      <span class="forecast-day">${day}</span>
                      <img src="img/${iconCode}.png"
                      alt="${description}" width="42" />
                      <span class="forecast-temp">
                        <span class="higher-limit"> ${tempMax}</span>
                        |
                        <span class="lower-limit"> ${tempMin}</span>
                        <span class="unit"> °C</span>
                      </span>
                    </div>
                  </div>
                </li>`;
    forecastMinTempsCelsius.push(tempMin);
    forecastMaxTempsCelsius.push(tempMax);
  });

  forecastElement.innerHTML = forecastHTML + "</ul>";
}

function getForecast(coordinates) {
  let apiKey = "f82fa348ac5be4c0a63ee7d2f60d4443";
  let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,current,hourly,alerts&units=metric&appid=${apiKey}`;
  axios.get(apiUrl).then(displayForecast);
}

// Celsius to Fahrenheit:
function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

// Metric <-> Imperial:
function changeUnits(event) {
  event.preventDefault();
  let todayTemp = document.querySelector("#current-temp");
  let forecast_min = document.querySelectorAll(".forecast-temp .lower-limit");
  let forecast_max = document.querySelectorAll(".forecast-temp .higher-limit");

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
    // Forecast
    for (let i = 0; i < forecast_min.length; i++) {
      forecast_min[i].innerHTML = forecastMinTempsCelsius[i];
      forecast_max[i].innerHTML = forecastMaxTempsCelsius[i];
    }

    let tempUnit = document.querySelectorAll(".forecast-temp .unit");
    tempUnit.forEach(function (unit) {
      unit.innerHTML = " °C";
    });
    //
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

    // Forecast
    for (let i = 0; i < forecast_min.length; i++) {
      forecast_min[i].innerHTML = celsiusToFahrenheit(
        forecastMinTempsCelsius[i]
      );
      forecast_max[i].innerHTML = celsiusToFahrenheit(
        forecastMaxTempsCelsius[i]
      );
    }

    let tempUnit = document.querySelectorAll(".forecast-temp .unit");
    tempUnit.forEach(function (unit) {
      unit.innerHTML = " °F";
    });
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

let forecastMinTempsCelsius = [];
let forecastMaxTempsCelsius = [];

let celsiusLink = document.querySelector("#celsius");
celsiusLink.addEventListener("click", changeUnits);

let fahrenheitLink = document.querySelector("#fahrenheit");
fahrenheitLink.addEventListener("click", changeUnits);
