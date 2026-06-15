let map;
let marker;
let routingControl;
let lastLatLng = [12.9716, 77.5946];
let updateTimer;
let timeOffset = 0; // Stores the variance between local system clock and Internet time

function setConnection(online) {
  const dot = document.getElementById('connDot');
  const text = document.getElementById('connText');
  if (!dot || !text) return;

  if (online) {
    dot.classList.remove('dot--offline');
    dot.classList.add('dot--online');
    text.textContent = 'Online';
  } else {
    dot.classList.remove('dot--online');
    dot.classList.add('dot--offline');
    text.textContent = 'Offline';
  }
}

function formatAgo(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return s <= 1 ? 'Just now' : `${s}s ago`;
}

function initMap() {
  map = L.map('map').setView(lastLatLng, 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  marker = L.marker(lastLatLng).addTo(map);

  // Initialize Routing Control with Geocoder search input field
  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(lastLatLng[0], lastLatLng[1])
    ],
    routeWhileDragging: false,
    geocoder: L.Control.Geocoder.nominatim(),
    lineOptions: {
      styles: [{ color: '#58a6ff', opacity: 0.8, weight: 6 }]
    }
  }).addTo(map);
}

function setLastUpdated() {
  const el = document.getElementById('lastUpdated');
  if (!el) return;
  el.dataset.lastTs = String(Date.now());
  el.textContent = 'Just now';
}

function startAgoTick() {
  if (updateTimer) clearInterval(updateTimer);
  updateTimer = setInterval(() => {
    const el = document.getElementById('lastUpdated');
    if (!el || !el.dataset.lastTs) return;
    const lastTs = Number(el.dataset.lastTs);
    el.textContent = formatAgo(Date.now() - lastTs);
  }, 1000);
}

// Fetch the actual time from the internet to resolve Raspberry Pi hardware clock drift
async function syncInternetTime() {
  try {
    const res = await fetch('https://worldtimeapi.org/api/ip');
    if (res.ok) {
      const data = await res.json();
      const internetTime = new Date(data.utc_datetime).getTime();
      const localTime = Date.now();
      timeOffset = internetTime - localTime; // Calculate delta offset
    }
  } catch (e) {
    console.error("Internet time sync failed, relying on system clock fallback.", e);
  }
}

// Tick the internet synchronized clock card independently every 1 second
function updateClockDisplay() {
  const synchronizedTime = new Date(Date.now() + timeOffset);
  document.getElementById('clock').innerText = synchronizedTime.toLocaleTimeString();
}

// Modal Document Preview Controller
function setupDocumentModals() {
  const modal = document.getElementById('docModal');
  const iframe = document.getElementById('docFrame');
  const closeBtn = document.querySelector('.close-btn');

  document.querySelectorAll('.doc').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // Halt new tab generation
      const docUrl = this.getAttribute('href');
      iframe.src = docUrl;
      modal.style.display = 'flex'; // Unveil modal
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    iframe.src = ''; // Flush iframe contents
  });

  // Close modal if user clicks outside content panel boundary area
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      iframe.src = '';
    }
  });
}

// Initializers
initMap();
setConnection(false);
startAgoTick();
syncInternetTime();
setupDocumentModals();

// Sync the time drift delta every 5 minutes
setInterval(syncInternetTime, 300000);
setInterval(updateClockDisplay, 1000);

async function updateDashboard() {
  try {
    // 1. Fetch GPS positions & update routing start origin dynamically
    const res = await fetch('/gps');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const gps = await res.json();

    const pos = [gps.lat, gps.lng];
    if (Array.isArray(pos) && pos.length === 2) {
      lastLatLng = pos;
      marker.setLatLng(pos);
      
      // Update the active navigation waypoint (index 0) to match moving scooter position
      if (routingControl) {
        const currentWaypoints = routingControl.getWaypoints();
        currentWaypoints[0] = L.routing.waypoint(L.latLng(pos[0], pos[1]));
        routingControl.setWaypoints(currentWaypoints);
      }
    }

    // 2. Fetch Remote Service center timeline variables
    const serviceRes = await fetch('/service');
    if (serviceRes.ok) {
      const serviceData = await serviceRes.json();
      const serviceEl = document.getElementById('service');
      serviceEl.innerText = serviceData.next_service;
      serviceEl.classList.remove('muted');
    }

    // 3. Fetch Telemetry Alert values 
    const potholeRes = await fetch('/pothole');
    if (potholeRes.ok) {
      const potholeData = await potholeRes.json();
      const alertEl = document.getElementById('alert');
      if (potholeData.alert) {
        alertEl.innerText = "POTHOLE DETECTED";
        alertEl.className = "badge badge--danger";
      } else {
        alertEl.innerText = "SAFE";
        alertEl.className = "badge badge--safe";
      }
    }

    setLastUpdated();
    setConnection(true);
  } catch (e) {
    setConnection(false);
  }
}

setInterval(updateDashboard, 1000);
updateDashboard();