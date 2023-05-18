//par défaut météo de Paris
//fetch pour météo de paris => tableau
//fonction render avec comme paramètre le tableau
//possibilité de chaanger la localisation avec soit : recherche ou géolocalisation

//state
let latitude = 48.85;
let longitude = 2.34;
let city = "Paris";
let unit = "°C";
let selectedDay = "week";
let daySelector;
let weekSelector;
let id = 0;

//comportement

async function fetchData() {
   let weatherCodes = await fetch("./weather_codes.json")
      .then((res) => res.json())
      .catch((e) => {
         new Error(e);
      });

   let data = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&current_weather=true&daily=precipitation_probability_mean,weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weathercode`
   ).then((res) => res.json());

   while (data.current_weather.time >= data.hourly.time[id]) {
      id++;
   }
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

document.addEventListener("DOMContentLoaded", () => {
   daySelector = document.querySelector(".day-selector");
   weekSelector = document.querySelector(".week-selector");

   daySelector.addEventListener("click", () => {
      daySelector.classList.add("selected-day");
      weekSelector.classList.remove("selected-day");
      selectedDay = "day";
      fetchData();
   });
   weekSelector.addEventListener("click", () => {
      daySelector.classList.remove("selected-day");
      weekSelector.classList.add("selected-day");
      selectedDay = "week";
      fetchData();
   });
});

//render

async function renderAside(data, weatherCodes) {
   const temp = document.querySelector(".temp");
   const day = document.querySelector(".day");
   const hour = document.querySelector(".hour");
   const weather_icon = document.querySelector(".weather-illustration");
   const description = document.querySelector(".description p");
   const rain = document.querySelector(".rain p");

   temp.innerHTML = Math.round(data.current_weather.temperature) + unit;
   day.innerHTML = getDayName("en-fr") + ",";
   hour.innerHTML = data.current_weather.time.split("T")[1];
   weather_icon.style.backgroundPosition =
      weatherCodes[data.current_weather.weathercode].image;
   description.textContent =
      weatherCodes[data.current_weather.weathercode].description;
   rain.innerHTML = `Rain - ${data.daily.precipitation_probability_mean[0]}%`;
}

async function renderWeekOverview(data, weatherCodes) {
   const weekOverview = document.querySelector(".week-overview");

   if (selectedDay === "week") {
      weekOverview.innerHTML = "";
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
   } else {
      weekOverview.innerHTML = "";
      for (let i = id; i < id + 10; i++) {
         weekOverview.innerHTML += `<div class="day-card">
            <p>${data.hourly.time[i].split("T")[1]}</p>
            <div class="daily-image-container" style="background-position: ${
               weatherCodes[data.hourly.weathercode[i]].weekOverview
            }"></div>
            <div class="daytime-temperature">
            <span class="max">${Math.round(
               data.hourly.temperature_2m[i]
            )}°C</span>
            </div>
         </div>`;
      }
   }
}
