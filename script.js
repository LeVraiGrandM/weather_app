//par défaut météo de Paris
//fetch pour météo de paris => tableau
//fonction render avec comme paramètre le tableau
//possibilité de chaanger la localisation avec soit : recherche ou géolocalisation

let latitude = 48.85;
let longitude = 2.34;
let unit = "°C";

let data = fetch(
   `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
)
   .then((res) => res.json())
   .then((data) => render(data));

function render(data) {
   const temp = document.querySelector(".temp");

   temp.innerHTML = Math.round(data.current_weather.temperature) + unit;
}
