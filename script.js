//state
let latitude = 48.85;
let longitude = 2.34;
let city = "Paris";
let unit = "°C";
let selectedDay = "day";
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
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&current_weather=true&daily=sunrise,sunset,precipitation_probability_mean,weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weathercode,uv_index,windspeed_10m,winddirection_10m`
   ).then((res) => res.json());

   while (data.current_weather.time >= data.hourly.time[id]) {
      id++;
   }
   renderAside(data, weatherCodes);
   renderWeekOverview(data, weatherCodes);
   renderUvComponent(data);
   renderWindComponent(data);
   renderSunriseSet(data);
}

fetchData();

function convertTZ(tzString) {
   return new Date().toLocaleTimeString("fr", { timeZone: tzString });
}

function getDayName(locale) {
   let date = new Date();
   return date.toLocaleDateString(locale, { weekday: "long" });
}

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

//render

function renderAside(data, weatherCodes) {
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

function renderWeekOverview(data, weatherCodes) {
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

function renderUvComponent(data) {
   const uvChart = document.getElementById("uv-index-graph");
   const ctx = uvChart.getContext("2d");
   ctx.strokeStyle = "#F3F3F4";
   ctx.beginPath();
   ctx.arc(uvChart.width / 2, uvChart.height, 110, Math.PI, 0);
   ctx.lineWidth = 20;
   ctx.stroke();
   ctx.strokeStyle = "#ffbf5e";
   ctx.beginPath();
   ctx.arc(
      uvChart.width / 2,
      uvChart.height,
      110,
      Math.PI,
      Math.PI +
         ((2 * Math.PI - Math.PI) * (data.hourly.uv_index[id] - 0)) / (15 - 0) //complex calculation which allows to pass from a scale of values from 0 to 12 (index uv cardinalPointed by the api) to a scale of values from PI to 2*PI (in gradians which is equivalent to a half circle) source: https://stackoverflow.com/questions/12959371/how-to-scale-windDirections-values
   );
   ctx.lineWidth = 30;
   ctx.stroke();
   ctx.font = "bold 40px sans-serif";
   ctx.textAlign = "center";
   ctx.fillText(data.hourly.uv_index[id], uvChart.width / 2, uvChart.height);
   ctx.font = "25px sans-serif";
   ctx.fillStyle = "#cccccc";
   ctx.fillText("6", 110, 20);
   ctx.fillText("12", 270, 70);
}

function renderWindComponent(data) {
   const windContainer = document.getElementById("wind");
   let windDirection = data.hourly.winddirection_10m[id];
   let cardinalPoint;

   if (windDirection >= 22.5 && windDirection < 67.5) {
      cardinalPoint = "NE";
   } else if (windDirection >= 67.5 && windDirection < 112.5) {
      cardinalPoint = "E";
   } else if (windDirection >= 112.5 && windDirection < 157.5) {
      cardinalPoint = "SE";
   } else if (windDirection >= 157.5 && windDirection < 202.5) {
      cardinalPoint = "S";
   } else if (windDirection >= 202.5 && windDirection < 247.5) {
      cardinalPoint = "SO";
   } else if (windDirection >= 247.5 && windDirection < 292.5) {
      cardinalPoint = "O";
   } else if (windDirection >= 292.5 && windDirection < 337) {
      cardinalPoint = "NO";
   } else if (windDirection >= 337 || windDirection < 22.5) {
      cardinalPoint = "N";
   }

   windContainer.innerHTML = `
   <p class="card-today-title">Wind Status</p>
                  <p class="wind">${data.hourly.windspeed_10m[id]}<span> km/h</span></p>
                  <div class="wind-direction">
                  <img src="assets/icons/navigation-2.svg" alt="" style="transform: rotate(${data.hourly.winddirection_10m[id]}deg)" class="wind-icon"/><span>${cardinalPoint}</span>
                  </div>`;
}

function renderSunriseSet(data) {
   const sunriseSetContainer = document.getElementById("sunrise-set");

   sunriseSetContainer.innerHTML = `
   <p class="card-today-title">Sunrise & Sunset</p>
                  <div class="sunrise-sunset">
                     <div>
                        <img src="assets/icons/arrow-up.svg" alt="" /><span
                           >${data.daily.sunrise[0].split("T")[1]}</span
                        >
                     </div>
                     <div>
                        <img src="assets/icons/arrow-down.svg" alt="" /><span
                           >${data.daily.sunset[0].split("T")[1]}</span
                        >
                     </div>
                  </div>`;
}
