function formatDate(date) {
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

  // Change day and time
  let dayTime = document.querySelector("#today-day-time");
  dayTime.innerHTML = `${day} ${hour}:${minutes}`;

  // Change date and year
  document.querySelector(
    "#today-date"
  ).innerHTML = `${month} ${dayOfMonth}, ${year}`;
}

function handleSubmit(event) {
  event.preventDefault();
  let cityInput = document.querySelector("#city-input").value.trim();
  searchCity(cityInput);
}

function searchCity(city) {
  let apiKey = "f82fa348ac5be4c0a63ee7d2f60d4443";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  axios.get(apiUrl).then(updateWeather);

  formatDate(new Date()); // update date
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
  console.log(document.querySelector("#celsius"));

  // Weather details:
  let feelsLike = Math.round(weatherData.main.feels_like);
  document.querySelector("#feels-like").innerHTML = `${feelsLike} °C`;
  // Temperature range:
  let minTemp = Math.round(weatherData.main.temp_min);
  let maxTemp = Math.round(weatherData.main.temp_max);
  document.querySelector(
    "#temp-range"
  ).innerHTML = `[${minTemp}, ${maxTemp}] °C`;

  let windSpeed = Math.round(weatherData.wind.speed);
  document.querySelector("#wind").innerHTML = `${windSpeed} m/s`; // change units elsewhere?

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
  let iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  document.querySelector("#icon").setAttribute("src", iconUrl);
  document.querySelector("#icon").setAttribute("alt", description);
}

// Celsius vs Fahrenheit:
function changeDegree(event) {
  event.preventDefault();
  let todayTemp = document.querySelector("#current-temp");

  let clickedDegree = event.target.id;
  let fahrSymbol = document.querySelector("#fahrenheit");
  let celsiusSymbol = document.querySelector("#celsius");
  if (
    clickedDegree === "celsius" &&
    !celsiusSymbol.classList.contains("chosenDegree")
  ) {
    // if celsius isn't already chosen
    //todayTemp.innerHTML = Math.round(((todayTemp.innerHTML - 32) * 5) / 9); // made up temperature
    todayTemp.innerHTML = Math.round(celsiusTemperature);
    celsiusSymbol.classList.add("chosenDegree");
    fahrSymbol.classList.remove("chosenDegree");
  } else if (
    clickedDegree === "fahrenheit" &&
    !fahrSymbol.classList.contains("chosenDegree")
  ) {
    // if fahrenheit isn't already chosen
    todayTemp.innerHTML = Math.round((todayTemp.innerHTML * 9) / 5 + 32); // assuming whats there is in C deg!!
    fahrSymbol.classList.add("chosenDegree");
    celsiusSymbol.classList.remove("chosenDegree");
  } else {
    // Do nothing if celsius or fahrenheit is already chosen when pressed
  }
}

function getWeatherCurrentLocation(position) {
  let longitude = position.coords.longitude;
  let latitude = position.coords.latitude;
  let apiKey = "f82fa348ac5be4c0a63ee7d2f60d4443";
  let units = "metric";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}`;
  axios.get(apiUrl).then(updateWeather);
  formatDate(new Date()); // update date - somewhere else?
}

searchCity("London"); // when the page is loaded

// Search for city button
let cityForm = document.querySelector("#city-form");
cityForm.addEventListener("submit", handleSubmit);

// Current button
let currentButton = document.querySelector("#current-button");
currentButton.addEventListener("click", function (event) {
  navigator.geolocation.getCurrentPosition(getWeatherCurrentLocation);
});

// F and C buttons

let celsiusTemperature = null;

let celsiusLink = document.querySelector("#celsius");
celsiusLink.addEventListener("click", changeDegree);

let fahrenheitLink = document.querySelector("#fahrenheit");
fahrenheitLink.addEventListener("click", changeDegree);
