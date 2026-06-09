let map;
let marker;
let lastSpeed = 0;
let lastLatLng = [12.9716, 77.5946];
let updateTimer;

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

initMap();
setConnection(false);
startAgoTick();

async function updateDashboard() {
  try {
    const res = await fetch('http://127.0.0.1:8080/gps');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const gps = await res.json();

    const speed = Number(gps.speed);
    if (!Number.isNaN(speed)) lastSpeed = speed;

    document.getElementById('speed').innerText = `${lastSpeed} km/h`;

    const pos = [gps.lat, gps.lng];
    if (Array.isArray(pos) && pos.length === 2) {
      lastLatLng = pos;
      marker.setLatLng(pos);
      map.panTo(pos);
    }

    setLastUpdated();
    setConnection(true);
  } catch (e) {
    // Keep last UI state; just show offline.
    setConnection(false);
  }
}

setInterval(updateDashboard, 1000);
updateDashboard();
