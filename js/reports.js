// Trip Reports functionality

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initFilters();
  initSorting();
  initWeatherWidget();
});

// Map initialization
let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('reportsMap'), {
    center: { lat: 39.8283, lng: -98.5795 },
    zoom: 4,
    styles: mapStyles
  });

  // Load report markers
  loadReportLocations();
}

const mapStyles = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      { color: "#193341" }
    ]
  },
  // Add more custom styles
];

async function loadReportLocations() {
  try {
    const response = await fetch('/api/reports/locations');
    const locations = await response.json();
    locations.forEach(createMarker);
  } catch (error) {
    console.error('Failed to load report locations:', error);
  }
}

function createMarker(location) {
  const marker = new google.maps.Marker({
    position: { lat: location.lat, lng: location.lng },
    map: map,
    title: location.title,
    icon: {
      url: `/images/markers/${location.type}.png`,
      scaledSize: new google.maps.Size(30, 30)
    }
  });

  const infoWindow = new google.maps.InfoWindow({
    content: createInfoWindowContent(location)
  });

  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });

  markers.push(marker);
}

function createInfoWindowContent(location) {
  return `
    <div class="map-info-window">
      <h3>${location.title}</h3>
      <div class="info-meta">
        <p><i class="fas fa-fish"></i> ${location.species.join(', ')}</p>
        <p><i class="fas fa-calendar"></i> ${location.date}</p>
      </div>
      <a href="/community/reports/${location.id}" class="btn-view-report">
        View Report
      </a>
    </div>
  `;
}

// Filters functionality
function initFilters() {
  const filterForm = document.querySelector('.filter-form');
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      applyFilters();
    });
  }
}

async function applyFilters() {
  const filters = {
    locations: getCheckedValues('location'),
    species: getCheckedValues('species'),
    timeframe: document.querySelector('select[name="timeframe"]').value
  };

  try {
    const response = await fetch('/api/reports/filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filters)
    });

    const reports = await response.json();
    updateReportsGrid(reports);
    updateMapMarkers(reports);
  } catch (error) {
    console.error('Filter application failed:', error);
    showErrorMessage('Unable to apply filters. Please try again.');
  }
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(input => input.value);
}

function updateReportsGrid(reports) {
  const grid = document.querySelector('.reports-grid');
  if (!grid) return;

  grid.innerHTML = reports.map(report => `
    <article class="report-card">
      <div class="report-image">
        <img src="${report.image}" alt="${report.title}">
        ${report.featured ? '<div class="report-badge">Featured</div>' : ''}
      </div>
      <div class="report-content">
        <div class="report-meta">
          <span class="location"><i class="fas fa-map-marker-alt"></i> ${report.location}</span>
          <span class="date"><i class="fas fa-calendar"></i> ${report.date}</span>
        </div>
        <h2><a href="/community/reports/${report.id}">${report.title}</a></h2>
        <div class="report-stats">
          <div class="stat">
            <i class="fas fa-fish"></i>
            <span>${report.catches} catches</span>
          </div>
          <div class="stat">
            <i class="fas fa-clock"></i>
            <span>${report.duration}</span>
          </div>
          <div class="stat">
            <i class="fas fa-thermometer-half"></i>
            <span>${report.temperature}</span>
          </div>
        </div>
        <p class="report-excerpt">${report.excerpt}</p>
        <div class="report-footer">
          <div class="author">
            <img src="${report.author.avatar}" alt="${report.author.name}'s avatar">
            <span>By ${report.author.name}</span>
          </div>
          <div class="engagement">
            <span><i class="fas fa-comment"></i> ${report.comments}</span>
            <span><i class="fas fa-heart"></i> ${report.likes}</span>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

// Sorting functionality
function initSorting() {
  const sortButtons = document.querySelectorAll('.sort-btn');
  sortButtons.forEach(button => {
    button.addEventListener('click', () => {
      sortButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      sortReports(button.textContent.toLowerCase());
    });
  });
}

async function sortReports(sortBy) {
  try {
    const response = await fetch(`/api/reports/sort?by=${sortBy}`);
    const reports = await response.json();
    updateReportsGrid(reports);
  } catch (error) {
    console.error('Sorting failed:', error);
    showErrorMessage('Unable to sort reports. Please try again.');
  }
}

// Weather widget
async function initWeatherWidget() {
  const widget = document.querySelector('.weather-widget .weather-content');
  if (!widget) return;

  try {
    // Get user's location
    const position = await getCurrentPosition();
    const weather = await fetchWeather(position.coords);
    
    widget.innerHTML = `
      <div class="weather-now">
        <div class="weather-icon">
          <img src="/images/weather/${weather.icon}.png" alt="${weather.description}">
        </div>
        <div class="weather-info">
          <div class="temperature">${weather.temp}°F</div>
          <div class="conditions">${weather.description}</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="detail">
          <span>Wind</span>
          <span>${weather.wind} mph</span>
        </div>
        <div class="detail">
          <span>Humidity</span>
          <span>${weather.humidity}%</span>
        </div>
        <div class="detail">
          <span>Pressure</span>
          <span>${weather.pressure} hPa</span>
        </div>
      </div>
      <div class="fishing-conditions">
        <h4>Fishing Conditions</h4>
        <div class="condition-rating ${weather.fishingCondition.rating}">
          ${weather.fishingCondition.description}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Weather widget initialization failed:', error);
    widget.innerHTML = '<p>Weather information unavailable</p>';
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
    }
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function fetchWeather(coords) {
  const response = await fetch(`/api/weather?lat=${coords.latitude}&lon=${coords.longitude}`);
  return await response.json();
}

// Utility functions
function showMessage(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showErrorMessage(message) {
  showMessage(message, 'error');
}