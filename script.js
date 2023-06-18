//state
let city = "Paris";
let unit;
let speedUnit;
let selectedDay = "day";
let id = 0;
let isDetailsOpened = false;

//default city (paris)
if (!localStorage.getItem("visited")) {
   localStorage.setItem("latitude", 48.85);
   localStorage.setItem("longitude", 2.34);
   localStorage.setItem("temperature-unit", "celsius");
   localStorage.setItem("speed-unit", "kmh");
   localStorage.setItem("visited", true);
}

//fetch data from open meteo
async function fetchData() {
   setUnit(
      localStorage.getItem("temperature-unit"),
      localStorage.getItem("speed-unit")
   );
   let weatherCodes = await fetch("./weather_codes.json")
      .then((res) => res.json())
      .catch((e) => {
         new Error(e);
      });

   let data = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${localStorage.getItem(
         "latitude"
      )}&longitude=${localStorage.getItem(
         "longitude"
      )}&timezone=auto&temperature_unit=${localStorage.getItem(
         "temperature-unit"
      )}&windspeed_unit=${localStorage.getItem(
         "speed-unit"
      )}&current_weather=true&daily=sunrise,sunset,precipitation_probability_mean,weathercode,temperature_2m_max,temperature_2m_min&hourly=visibility,relativehumidity_2m,temperature_2m,weathercode,uv_index,windspeed_10m,winddirection_10m`
   ).then((res) => res.json());

   let airQuality = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${localStorage.getItem(
         "latitude"
      )}&longitude=${localStorage.getItem("longitude")}&hourly=european_aqi`
   ).then((res) => res.json());

   while (data.current_weather.time >= data.hourly.time[id]) {
      id++;
   }
   renderAside(data, weatherCodes);
   renderWeekOverview(data, weatherCodes);
   renderUv(data);
   renderWind(data);
   renderSunriseSet(data);
   renderHumidity(data);
   renderVisibility(data);
   renderAirQuality(airQuality);
}

fetchData();

function getDayName(locale) {
   let date = new Date();
   return date.toLocaleDateString(locale, { weekday: "long" });
}

let daySelector = document.querySelector(".day-selector");
let weekSelector = document.querySelector(".week-selector");

//switch to day view
daySelector.addEventListener("click", () => {
   daySelector.classList.add("selected-day");
   weekSelector.classList.remove("selected-day");
   selectedDay = "day";
   fetchData();
});

//switch to week view
weekSelector.addEventListener("click", () => {
   daySelector.classList.remove("selected-day");
   weekSelector.classList.add("selected-day");
   selectedDay = "week";
   fetchData();
});

//open settings menu
document.querySelector(".settings-button").addEventListener("click", () => {
   document.querySelector(".settings").style.visibility = "visible";
   document.querySelector(".settings").style.transform =
      "translate(-50%, -50%)";
});

//close settings menu
document.querySelector(".close-settings").addEventListener("click", () => {
   document.querySelector(".settings").style.transform =
      "translate(-50%, 100%)";
   window.setTimeout(() => {
      document.querySelector(".settings").style.visibility = "hidden";
   }, 300);
});

//listens for the value of the "select" tag relative to the temperature unit
document.getElementById("temperature-unit").addEventListener("input", (e) => {
   localStorage.setItem("temperature-unit", e.target.value);
   setUnit(e.target.value, localStorage.getItem("speed-unit"));
   fetchData();
});

function setUnit(tempUnit, spedUnit) {
   if (tempUnit == "celsius") {
      unit = "°C";
   } else {
      unit = "°";
   }
   if (spedUnit == "kmh") {
      speedUnit = "km/h";
   } else if (spedUnit === "mph") {
      speedUnit = "mph";
   } else {
      speedUnit = "m/s";
   }
}

//listens for the value of the "select" tag relative to the temperature unit
document.getElementById("speed-unit").addEventListener("input", (e) => {
   localStorage.setItem("speed-unit", e.target.value);
   setUnit(localStorage.getItem("temperature-unit"), e.target.value);
   fetchData();
});

//search
document.querySelector(".search-input").addEventListener("input", async (e) => {
   document.querySelector(".search-results").innerHTML = "";
   if (e.target.value.length >= 3) {
      document.querySelector(".search-results").style.visibility = "visible";
      let result = await fetch(
         `https://geocoding-api.open-meteo.com/v1/search?name=${e.target.value}&count=5&language=en&format=json`
      )
         .then((res) => res.json())
         .then((data) => data.results);

      await result.forEach((element) => {
         document.querySelector(".search-results").innerHTML += `
         <div class="result" data-lat="${element.latitude}" data-long="${element.longitude}">
                  <img src="https://flagsapi.com/${element.country_code}/flat/64.png" alt="" />
                  <p>${element.name}, ${element.country}</p>
               </div>
         `;
      });

      document.querySelectorAll(".result").forEach((e) => {
         e.addEventListener("click", () => {
            localStorage.setItem("latitude", e.dataset.lat);
            localStorage.setItem("longitude", e.dataset.long);
            document.querySelector(".search-results").style.visibility =
               "hidden";
            fetchData();
         });
      });
   } else {
      document.querySelector(".search-results").style.visibility = "hidden";
   }
});

//geolocation
document.querySelector(".locate-button").addEventListener("click", () => {
   navigator.geolocation.getCurrentPosition(
      (pos) => {
         localStorage.setItem("latitude", pos.coords.latitude);
         localStorage.setItem("longitude", pos.coords.longitude);
         fetchData();
      },
      (err) => {
         switch (err.code) {
            case 1:
               alert("Error: you have refused access to your position");
               break;
            case 2:
               alert("Error: Unable to access your position");
               break;
            default:
               alert("An error has occurred, please try again.");
               break;
         }
      }
   );
});

document.addEventListener("click", (e) => {
   if (
      (e.target.parentElement.className === "day-card" ||
         e.target.className === "day-card") &&
      isDetailsOpened === false
   ) {
      let box = document.createElement("div");
      box.classList.add("box");
      box.style.top = e.pageY - 120 + "px";
      if (e.pageX < 300) {
         box.style.left = 20 + "px";
      } else if (e.pageX > window.innerWidth - 200) {
         box.style.right = 20 + "px";
      } else {
         box.style.left = e.pageX - 150 + "px";
      } // these conditions ensure that the popup does not protrude to the right or left for optimal display
      isDetailsOpened = true;
      renderSettings(e.target).then((data) => {
         box.innerHTML = data;
      });
      document.body.appendChild(box);
   } else if (e.target.parentElement.classList[1] === "close-details") {
      isDetailsOpened = false;
      document.body.removeChild(document.querySelector(".box"));
   }
});

//close details

//render

function renderAside(data, weatherCodes) {
   const temp = document.querySelector(".temp");
   const day = document.querySelector(".day");
   const hour = document.querySelector(".hour");
   const weather_icon = document.querySelector(".weather-illustration");
   const description = document.querySelector(".description p");
   const rain = document.querySelector(".rain p");
   const city = document.querySelector(".city p");

   temp.innerHTML = Math.round(data.current_weather.temperature) + unit;
   day.innerHTML = getDayName("en-fr") + ",";
   hour.innerHTML = data.current_weather.time.split("T")[1];
   weather_icon.style.backgroundPosition =
      weatherCodes[data.current_weather.weathercode].image;
   description.textContent =
      weatherCodes[data.current_weather.weathercode].description;
   rain.innerHTML = `Rain - ${data.daily.precipitation_probability_mean[0]}%`;
   fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${localStorage.getItem(
         "latitude"
      )}&lon=${localStorage.getItem("longitude")}&format=json`
   )
      .then((res) => res.json())
      .then(
         (data) =>
            (city.innerHTML = data.address.city + ", " + data.address.country)
      );
}

function renderWeekOverview(data, weatherCodes) {
   const weekOverview = document.querySelector(".week-overview");

   if (selectedDay === "week") {
      weekOverview.innerHTML = "";
      for (let i = 0; i < 7; i++) {
         weekOverview.innerHTML += `<div class="day-card" data-index="${i}">
            <p>${new Date(data.daily.time[i]).toLocaleString("en", {
               weekday: "long",
            })}</p>
            <div class="daily-image-container" style="background-position: ${
               weatherCodes[data.daily.weathercode[i]].weekOverview
            }" data-index="${i}"></div>
            <div class="daytime-temperature" data-index="${i}">
            <span class="max">${Math.round(
               data.daily.temperature_2m_max[i]
            )}${unit}</span>
            <span class="min-temp">${Math.round(
               data.daily.temperature_2m_min[i]
            )}${unit}</span>
            </div>
         </div>`;
      }
   } else {
      weekOverview.innerHTML = "";
      for (let i = id; i < id + 10; i++) {
         weekOverview.innerHTML += `<div class="day-card" data-index="${i}">
            <p data-index="${i}">${data.hourly.time[i].split("T")[1]}</p>
            <div class="daily-image-container" data-index="${i}"style="background-position: ${
            weatherCodes[data.hourly.weathercode[i]].weekOverview
         }"></div>
            <div class="daytime-temperature" data-index="${i}">
            <span class="max">${Math.round(
               data.hourly.temperature_2m[i]
            )}${unit}</span>
            </div>
         </div>`;
      }
   }
}

function renderUv(data) {
   const uvChart = document.getElementById("uv-index-graph");
   const ctx = uvChart.getContext("2d");
   ctx.clearRect(0, 0, uvChart.width, uvChart.height);
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
   ctx.fontStyle = "#000";
   ctx.textAlign = "center";
   ctx.fillText(data.hourly.uv_index[id], uvChart.width / 2, uvChart.height);
   ctx.font = "25px sans-serif";
   ctx.fillStyle = "#cccccc";
   ctx.fillText("6", 110, 20);
   ctx.fillText("12", 270, 70);
}

function renderWind(data) {
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
                  <p class="wind">${data.hourly.windspeed_10m[id]}<span> ${speedUnit}</span></p>
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

function renderHumidity(data) {
   const humidity = document.getElementById("humidity");
   let humidityStatus;

   if (data.hourly.relativehumidity_2m[id] < 30) {
      humidityStatus = "Dry 🥶";
   } else if (
      data.hourly.relativehumidity_2m[id] >= 30 &&
      data.hourly.relativehumidity_2m[id] < 60
   ) {
      humidityStatus = "Normal 🤙";
   } else {
      humidityStatus = "Humid 😓";
   }

   humidity.innerHTML = `
   <p class="card-today-title">Humidity</p>
                  <p class="humidity-level">${data.hourly.relativehumidity_2m[id]}<sup>%</sup></p>
                  <p class="humidity-status">${humidityStatus}</p>
                  <div class="slider-container">
                     <div class="slider-cursor slider-humidity"></div>
                  </div>`;

   document.querySelector(".slider-humidity").style.bottom =
      (data.hourly.relativehumidity_2m[id] * 77) / 100 + "%";
}

function renderVisibility(data) {
   const visibility = document.getElementById("visibility");
   let visibilityStatus;

   if (data.hourly.visibility[id] > 9260) {
      visibilityStatus = "Good 😀";
   } else if (
      data.hourly.visibility[id] <= 9260 &&
      data.hourly.visibility[id] > 3704
   ) {
      visibilityStatus = "Average 😕";
   } else if (
      data.hourly.visibility[id] <= 3704 &&
      data.hourly.visibility[id] > 926
   ) {
      visibilityStatus = "Bad 🙁";
   } else {
      visibilityStatus = "Very Bad 😖";
   }

   visibility.innerHTML = `
   <p class="card-today-title">Visibility</p>
   <p class="visibility-distance">${
      data.hourly.visibility[id] / 1000
   } <span>km</span></p>
   <p class="visibility-status">${visibilityStatus}</p>
   `;
}

function renderAirQuality(airQuality) {
   let airQualityStatus;

   if (airQuality.hourly.european_aqi[id] < 20) {
      airQualityStatus = "Good 👍";
   } else if (airQuality.hourly.european_aqi[id] < 40) {
      airQualityStatus = "Fair 😐";
   } else if (airQuality.hourly.european_aqi[id] < 60) {
      airQualityStatus = "Moderate 😕";
   } else if (airQuality.hourly.european_aqi[id] < 80) {
      airQualityStatus = "Poor 👎";
   } else {
      airQualityStatus = "Very Poor 😖";
   }

   document.getElementById("air-quality").innerHTML = `
   <p class="card-today-title">Air Quality</p>
                  <p class="air-quality-index">${airQuality.hourly.european_aqi[id]}</p>
                  <p class="air-quality-status">${airQualityStatus}</p>
                  <div class="slider-container">
                     <div class="slider-cursor slider-air-quality"></div>
                  </div>
   `;

   document.querySelector(".slider-air-quality").style.bottom =
      (airQuality.hourly.european_aqi[id] * 77) / 100 + "%";
}

async function renderSettings(element) {
   let data = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${localStorage.getItem(
         "latitude"
      )}&longitude=${localStorage.getItem(
         "longitude"
      )}&temperature_unit=${localStorage.getItem(
         "temperature-unit"
      )}&windspeed_unit=${localStorage.getItem(
         "speed-unit"
      )}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,apparent_temperature_max,precipitation_sum,windspeed_10m_max&timezone=auto`
   ).then((res) => res.json());

   let weatherCodes = await fetch("./weather_codes.json")
      .then((res) => res.json())
      .catch((e) => {
         new Error(e);
      });

   let precipitationDescription;

   if (data.hourly.precipitation[element.dataset.index] === 0) {
      precipitationDescription = "No precipation excepted";
   } else {
      precipitationDescription =
         "Precipitation is expected (" +
         data.hourly.precipitation[element.dataset.index] +
         "mm)";
   }
   if (selectedDay === "day") {
      return `<p class="box-description">${
         weatherCodes[data.hourly.weathercode[element.dataset.index]]
            .description
      }</p>
   <hr class="box-separation-line" />
   <div class="box-details">
      <p>Temperature : <strong>${
         data.hourly.temperature_2m[element.dataset.index]
      }°C</strong></p>
      <p>Humidity : <strong>${
         data.hourly.relativehumidity_2m[element.dataset.index]
      }%</strong></p>
      <p>Wind Speed : <strong>${
         data.hourly.windspeed_10m[element.dataset.index]
      }km/h</strong></p>
   </div>
   <hr class="box-separation-line" />
   <p>The perceived temperature is <strong>${
      data.hourly.apparent_temperature[element.dataset.index]
   }</strong></p>
   <hr class="box-separation-line" />
   <p>${precipitationDescription}</p>
   <button class="close close-details">
            <img src="./assets/icons/x.svg" alt="" />
         </button>`;
   } else {
      return `<p class="box-description">${
         weatherCodes[data.daily.weathercode[element.dataset.index]].description
      }</p>
   <hr class="box-separation-line" />
   <div class="box-details">
      <p>Max Temperature : <strong>${
         data.daily.temperature_2m_max[element.dataset.index]
      }°C</strong></p>
      <p>Max Wind Speed : <strong>${
         data.daily.windspeed_10m_max[element.dataset.index]
      }km/h</strong></p>
   </div>
   <hr class="box-separation-line" />
   <p>The maximum perceived temperature is <strong>${
      data.daily.apparent_temperature_max[element.dataset.index]
   }</strong></p>
   <hr class="box-separation-line" />
   <p>${precipitationDescription}</p>
   <button class="close close-details">
            <img src="./assets/icons/x.svg" alt="" />
         </button>`;
   }
}
//service worker

if ("serviceWorker" in navigator) {
   navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
         console.log("Enregistrement réussi");
      })
      .catch((error) => {
         console.log("Erreur : " + error);
      });
}
