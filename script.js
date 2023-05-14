//par défaut météo de Paris
//fetch pour météo de paris => tableau
//fonction render avec comme paramètre le tableau
//possibilité de chaanger la localisation avec soit : recherche ou géolocalisation

let latitude = 48.85;
let longitude = 2.34;
let city = "Paris";
let unit = "°C";
let weather_codes;

fetch("./weather_codes.json")
   .then((res) => res.json())
   .then((data) => (weather_codes = data));

let data = fetch(
   `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&current_weather=true&daily=precipitation_probability_mean,weathercode,temperature_2m_max,temperature_2m_min`
)
   .then((res) => res.json())
   .then((data) => render(data));

function render(data) {
   const temp = document.querySelector(".temp");
   const day = document.querySelector(".day");
   const hour = document.querySelector(".hour");
   const weather_icon = document.querySelector(".weather_icon");
   const description = document.querySelector(".description");
   const rain = document.querySelector(".rain");
   const weekOverview = document.querySelector(".week-overview");
   let date = convertTZ(data.timezone);

   temp.innerHTML = Math.round(data.current_weather.temperature) + unit;
   day.innerHTML = getDayName("en-fr") + ",";
   hour.innerHTML = date.substring(0, 5);
   weather_icon.src = weather_codes[data.current_weather.weathercode].image;
   description.innerHTML +=
      weather_codes[data.current_weather.weathercode].description;
   rain.innerHTML += `Rain - ${data.daily.precipitation_probability_mean[0]}%`;

   for (let i = 0; i < 7; i++) {
      weekOverview.innerHTML += `<div class="day-card">
      <p>${new Date(data.daily.time[i]).toLocaleString("en", {
         weekday: "long",
      })}</p>
      <div class="daily-image-container">
      <img
        src="${weather_codes[data.daily.weathercode[i]].image}"
        alt=""
        class="illustration"
      />
      </div>
      <div class="daytime-temperature">
        <span class="max">${Math.round(
           data.daily.temperature_2m_max[i]
        )}°C</span>
        <span class="min-temp">${Math.round(
           data.daily.temperature_2m_min[i]
        )}°C</span>
      </div>
    </div>`;
   }
}

function convertTZ(tzString) {
   return new Date().toLocaleTimeString("fr", { timeZone: tzString });
}

function getDayName(locale) {
   let date = new Date();
   return date.toLocaleDateString(locale, { weekday: "long" });
}
