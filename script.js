const crimeLocation = document.getElementById("location");
const crimeTime = document.getElementById("date");
const userName = document.getElementById("username");
const geolocationBtn = document.getElementById("geolocation-btn");
const reportCrimeBtn = document.getElementById("report-crime-btn");
const modal = document.getElementById("modal");
const crimeForm = document.getElementById("crimeForm");
const crimeType = document.getElementById("crimeType");
const crimeDescription = document.getElementById("crimeDescription");
const urgentCheck = document.getElementById("urgent");

const map = L.map("map").setView([53.350498598, -6.252332324], 15);

let CRIME_LAT_LNG = "";

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const userIcon = L.icon({
  iconUrl: "./assets/images/usericon.png",
  iconSize: [80, 80],
  iconAnchor: [16, 32],
});

async function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, maximumAge: 10000 }
      );
    } else {
      reject(new Error("Geolocation is not supported by the browser."));
    }
  });
}

async function getCurrentLocationLatLng() {
  try {
    const position = await getLocation();
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    return { lat, lng };
  } catch (error) {
    alert("Unable to find location - default to Dublin");
    return { lat: 53.34, lng: -6.26 };
  }
}

async function flyToCurrentLocation() {
  geolocationBtn.innerHTML = "";
  const loader = document.createElement("div");
  loader.id = "loader";
  geolocationBtn.appendChild(loader);
  const { lat, lng } = await getCurrentLocationLatLng();

  geolocationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';

  map.flyTo([lat, lng], 16);
  placeMarker([lat, lng], userIcon);
}

function placeMarker(location, icon) {
  let marker;
  icon
    ? (marker = L.marker(location, { icon: icon }).addTo(map))
    : (marker = L.marker(location).addTo(map));
  return marker;
}

function reportCrime(e) {
  e.preventDefault();
  const type = crimeType.value;
  const description = crimeDescription.value;
  const isUrgent = urgentCheck.checked;
  const currentTime = new Date().toLocaleString();

  //   send data to DB
  const data = {
    type,
    description,
    isUrgent,
    crimeTime,
    reportedBy: "Admin",
  };

  const marker = placeMarker(CRIME_LAT_LNG);

  const tooltipContent = `${type} <br />
                            ${description} <br />
                            ${isUrgent ? "Urgent" : ""} <br />
                            ${currentTime}`;

  marker.bindTooltip(tooltipContent).openTooltip();

  CRIME_LAT_LNG = "";

  modal.style.display = "none";
}

function displayForm(e) {
  modal.style.display = "flex";
  CRIME_LAT_LNG = e.latlng;
}

function closeModal() {
  modal.style.display = "none";
}

map.on("click", displayForm);

modal.addEventListener("click", closeModal);
geolocationBtn.addEventListener("click", flyToCurrentLocation);
reportCrimeBtn.addEventListener("click", displayForm);
crimeForm.addEventListener("submit", reportCrime);
crimeForm.addEventListener("click", (e) => e.stopPropagation());
