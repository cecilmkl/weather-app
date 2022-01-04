let weather = {
  paris: {
    temp: 19.7,
    humidity: 80,
  },
  tokyo: {
    temp: 17.3,
    humidity: 50,
  },
  lisbon: {
    temp: 30.2,
    humidity: 20,
  },
  "san francisco": {
    temp: 20.9,
    humidity: 100,
  },
  moscow: {
    temp: -5,
    humidity: 20,
  },
};

let cityName = prompt("Enter a city").trim().toLowerCase();

if (weather.hasOwnProperty(cityName)) {
  let temperature = Math.round(weather[cityName].temp);
  let tempF = (temperature * 9) / 5 + 32;
  let humid = weather[cityName].humidity;

  cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  if (cityName.includes(" ")) {
    let indexNewWord = cityName.indexOf(" ") + 1;
    cityName =
      cityName.slice(0, indexNewWord) +
      cityName.charAt(indexNewWord).toUpperCase() +
      cityName.slice(indexNewWord + 1);
  }

  alert(
    `It is currently ${temperature}°C (${tempF}°F) in ${cityName} with a humidity of ${humid} %`
  );
} else if (cityName === "") {
  alert("Please enter a city.");
} else {
  alert(
    `Sorry, we don't know the weather for this city, try going to https://www.google.com/search?q=weather+${cityName
      .toLowerCase()
      .replaceAll(" ", "+")}`
  );
}
