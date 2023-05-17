//par défaut météo de Paris
//fetch pour météo de paris => tableau
//fonction render avec comme paramètre le tableau
//possibilité de chaanger la localisation avec soit : recherche ou géolocalisation

//state
let latitude = 48.85;
let longitude = 2.34;
let city = "Paris";
let unit = "°C";
//comportement

async function fetchData() {
   let weatherCodes = await fetch("./weather_codes.json")
      .then((res) => res.json())
      .catch((e) => {
         new Error(e);
      });

   let data = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&current_weather=true&daily=precipitation_probability_mean,weathercode,temperature_2m_max,temperature_2m_min`
   ).then((res) => res.json());

   renderAside(data, weatherCodes);
   renderWeekOverview(data, weatherCodes);
}

fetchData();

function convertTZ(tzString) {
   return new Date().toLocaleTimeString("fr", { timeZone: tzString });
}

function getDayName(locale) {
   let date = new Date();
   return date.toLocaleDateString(locale, { weekday: "long" });
}
//render

async function renderAside(data, weatherCodes) {
   const temp = document.querySelector(".temp");
   const day = document.querySelector(".day");
   const hour = document.querySelector(".hour");
   const weather_icon = document.querySelector(".weather-illustration");
   const description = document.querySelector(".description");
   const rain = document.querySelector(".rain");
   let date = convertTZ(data.timezone);

   temp.innerHTML = Math.round(data.current_weather.temperature) + unit;
   day.innerHTML = getDayName("en-fr") + ",";
   hour.innerHTML = date.substring(0, 5);
   weather_icon.style.backgroundPosition =
      weatherCodes[data.current_weather.weathercode].image;
   description.innerHTML +=
      weatherCodes[data.current_weather.weathercode].description;
   rain.innerHTML += `Rain - ${data.daily.precipitation_probability_mean[0]}%`;
}

async function renderWeekOverview(data, weatherCodes) {
   const weekOverview = document.querySelector(".week-overview");

   for (let i = 0; i < 7; i++) {
      weekOverview.innerHTML += `<div class="day-card">
         <p>${new Date(data.daily.time[i]).toLocaleString("en", {
            weekday: "long",
         })}</p>
         <div class="daily-image-container" style="background-position: ${
            weatherCodes[data.daily.weathercode[i]].weekOverview
         }"></div>
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
