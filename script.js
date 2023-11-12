import userIconImage from "./assets/images/usericon.png";

const crimeLocation = document.getElementById("location");
const crimeTime = document.getElementById("date");
const userName = document.getElementById("username");

const map = L.map("map").setView([53.350498598, -6.252332324], 15);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const userIcon = L.icon({
  iconUrl: userIconImage,
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
  const { lat, lng } = await getCurrentLocationLatLng();
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
  placeMarker(e.latlng);

  const { lat, lng } = e.latlng;
  const currentTime = new Date().toLocaleString();

  crimeLocation.innerText = `Crime at ${lat} ${lng}`;
  crimeTime.innerText = currentTime;
  userName.innerText = "Reported by: Admin";
}

map.on("click", reportCrime);

flyToCurrentLocation();
