const apiKey = "f00c38e0279b7bc85480c3fe775d518c";
let locationName = "Copenhagen";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.log("Service Worker failed:", err));
  });
}

$(document).ready(() => {
  updateQuestionText();

  // Question page: click anywhere
  $("#check-weather-btn").on("click", showWeatherPage);

  // Weather page buttons
  $("#back-btn").on("click", () => showPage("#question-page"));
  $("#settings-btn").on("click", () => showPage("#settings-page"));

  // Settings page back
  $("#back-btn2").on("click", () => showPage("#question-page"));

  // Settings input autocomplete using jQuery UI
  $("#location-input").autocomplete({
    minLength: 2, // start suggesting after 2 characters
    source: async function(request, response) {
      try {
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${request.term}&limit=5&appid=${apiKey}`);
        const results = await res.json();

        const list = results.map(item => {
          const state = item.state ? `, ${item.state}` : "";
          return {
            label: `${item.name}${state}, ${item.country}`, // shown in dropdown
            value: item.name // saved when selected
          };
        });

        response(list);
      } catch (err) {
        console.error(err);
        response([]);
      }
    }
  });

  // Press Enter in input triggers save
  $("#location-input").on("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      $("#save-location-btn").click();
    }
  });

  // Save location
  $("#save-location-btn").on("click", async () => {
    const selectedLoc = $("#location-input").val().trim();
    if (!selectedLoc) {
      alert("Please select a location");
      return;
    }

    try {
      // Validate via weather API
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${selectedLoc}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      locationName = data.name;
      updateQuestionText();
      $("#location-input").val("");
      showPage("#question-page");

    } catch (error) {
      alert("City not found. Please try again.");
    }
  });
});

// ---------- Helper Functions ----------
function showPage(pageId) {
  $(".page").removeClass("active");
  $(pageId).addClass("active");
}

function updateQuestionText() {
  $("#question-city").text(`${locationName}?`);
}

// ---------- WEATHER FUNCTIONS ----------
function getWeatherIcon(weatherId, isDaytime) {
  let iconFile = "sun"; // default

  if (weatherId >= 200 && weatherId < 300) iconFile = "thunder";
  else if (weatherId >= 300 && weatherId < 400) iconFile = "rain_little";
  else if (weatherId >= 500 && weatherId < 502) iconFile = "rain";
  else if (weatherId >= 502 && weatherId < 600) iconFile = "rain_heavy";
  else if (weatherId >= 600 && weatherId < 700) iconFile = "rain_heavy";
  else if (weatherId >= 600 && weatherId < 700) iconFile = "snow";
  else if (weatherId >= 700 && weatherId < 800) iconFile = "cloud";
  else if (weatherId === 800) iconFile = isDaytime ? "sun" : "night";
  else if (weatherId >= 801 && weatherId <= 803) iconFile = isDaytime ? "cloud_partly" : "cloud_partly_night";
  else if (weatherId === 804) iconFile = "cloud";

  return `icons/${iconFile}.svg`;
}

async function showWeatherPage() {
  try {
    // Get current weather
    const currentRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${apiKey}&units=metric`
    );
    const currentData = await currentRes.json();
    if (!currentRes.ok) throw new Error(currentData.message);

    const { lat, lon } = currentData.coord;

    console.log(currentData);

    const weatherId = currentData.weather[0].id;
    const now = currentData.dt;
    const sunrise = currentData.sys.sunrise;
    const sunset = currentData.sys.sunset;
    const isDaytime = now >= sunrise && now <= sunset;
    const sunny = (weatherId >= 800 && weatherId < 803) && isDaytime;

    // Update weather page
    $("#weather-city").text(currentData.name);
    $("#weather-coords").text(`Lat: ${lat.toFixed(2)} | Lon: ${lon.toFixed(2)}`);
    $("#sunny-answer").text(sunny ? "YES" : "NO");
    $("#weather-description").text(currentData.weather[0].description);
    $("#temperature").text(`${Math.round(currentData.main.temp)} °C`);

    const rain = currentData.rain ? currentData.rain["1h"] || currentData.rain["3h"] || 0 : 0;
    $("#precipitation").text(`Precipitation: ${rain} mm`);
    $("#wind").text(`Wind: ${currentData.wind.speed} m/s`);

    // Update icon
    const iconUrl = getWeatherIcon(weatherId, isDaytime);
    $("#weather-icon").attr("src", iconUrl);
    $("#weather-icon").attr("alt", currentData.weather[0].description);

    showPage("#weather-page");

  } catch (error) {
    alert("Error fetching weather data: " + error.message);
    showPage("#question-page");
  }
}
