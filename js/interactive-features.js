// Initialize all interactive features
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeWeather();
    initializeCalendar();
    initializeGearComparison();
});

// Map Functionality
function initializeMap() {
    // Initialize Mapbox map
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';
    const map = new mapboxgl.Map({
        container: 'fishingMap',
        style: 'mapbox://styles/mapbox/outdoors-v11',
        center: [-97.7431, 30.2672], // Austin, TX coordinates
        zoom: 9
    });

    // Add map controls
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));

    // Handle filter changes
    document.getElementById('spotType').addEventListener('change', filterSpots);
    document.getElementById('fishType').addEventListener('change', filterSpots);

    // Load fishing spots
    loadFishingSpots();
}

async function loadFishingSpots() {
    try {
        const response = await fetch('/api/fishing-spots');
        const spots = await response.json();
        
        spots.forEach(spot => {
            addSpotToMap(spot);
            addSpotToList(spot);
        });
    } catch (error) {
        console.error('Error loading fishing spots:', error);
    }
}

function addSpotToMap(spot) {
    // Add marker to map
    const el = document.createElement('div');
    el.className = 'marker';
    el.dataset.type = spot.type;
    el.dataset.species = spot.species.join(',');

    new mapboxgl.Marker(el)
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <h3>${spot.name}</h3>
                <p>${spot.description}</p>
                <p><strong>Species:</strong> ${spot.species.join(', ')}</p>
            `))
        .addTo(map);
}

function addSpotToList(spot) {
    const list = document.querySelector('.spot-list');
    const item = document.createElement('div');
    item.className = 'spot-item';
    item.dataset.type = spot.type;
    item.dataset.species = spot.species.join(',');
    
    item.innerHTML = `
        <h4>${spot.name}</h4>
        <p>${spot.description}</p>
        <div class="spot-meta">
            <span class="type">${spot.type}</span>
            <span class="distance">${spot.distance}mi</span>
        </div>
    `;
    
    list.appendChild(item);
}

function filterSpots() {
    const spotType = document.getElementById('spotType').value;
    const fishType = document.getElementById('fishType').value;
    
    document.querySelectorAll('.marker, .spot-item').forEach(el => {
        const showSpot = (spotType === 'all' || el.dataset.type === spotType) &&
                        (fishType === 'all' || el.dataset.species.includes(fishType));
        
        el.style.display = showSpot ? 'block' : 'none';
    });
}

// Weather Functionality
async function initializeWeather() {
    try {
        const weather = await fetchWeather();
        updateWeatherDisplay(weather);
        updateForecast(weather.forecast);
    } catch (error) {
        console.error('Error initializing weather:', error);
    }
}

async function fetchWeather() {
    const response = await fetch('/api/weather');
    return response.json();
}

function updateWeatherDisplay(weather) {
    document.querySelector('.temperature').textContent = `${weather.temp}°F`;
    document.querySelector('.conditions').textContent = weather.conditions;
    document.querySelector('.weather-icon i').className = `fas ${getWeatherIcon(weather.conditions)}`;
    
    // Update details
    document.querySelector('[data-detail="wind"]').textContent = `${weather.windSpeed} mph ${weather.windDirection}`;
    document.querySelector('[data-detail="humidity"]').textContent = `${weather.humidity}%`;
    document.querySelector('[data-detail="water-temp"]').textContent = `${weather.waterTemp}°F`;
}

function updateForecast(forecast) {
    const forecastGrid = document.querySelector('.forecast-grid');
    forecastGrid.innerHTML = forecast.map(day => `
        <div class="weather-card">
            <div class="forecast-date">${formatDate(day.date)}</div>
            <i class="fas ${getWeatherIcon(day.conditions)}"></i>
            <div class="forecast-temps">
                <span class="high">${day.highTemp}°</span>
                <span class="low">${day.lowTemp}°</span>
            </div>
            <div class="forecast-conditions">${day.conditions}</div>
        </div>
    `).join('');
}

// Calendar Functionality
function initializeCalendar() {
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    renderCalendar(currentMonth, currentYear);
    loadEvents();

    document.querySelector('.prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    document.querySelector('.next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
    });
}

function renderCalendar(month, year) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const grid = document.querySelector('.calendar-grid');
    
    document.querySelector('.current-month').textContent = 
        new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    let html = '';
    // Add day headers
    'SMTWTFS'.split('').forEach(day => {
        html += `<div class="calendar-day header">${day}</div>`;
    });

    // Add blank days
    for (let i = 0; i < firstDay.getDay(); i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Add days
    for (let day = 1; day <= lastDay.getDate(); day++) {
        html += `
            <div class="calendar-day" data-date="${year}-${month + 1}-${day}">
                <span class="day-number">${day}</span>
                <div class="day-events"></div>
            </div>
        `;
    }

    grid.innerHTML = html;
}

async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        
        events.forEach(event => {
            const date = new Date(event.date);
            const dayEl = document.querySelector(`[data-date="${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}"]`);
            
            if (dayEl) {
                dayEl.classList.add('has-event');
                dayEl.querySelector('.day-events').innerHTML += `
                    <div class="event-dot" title="${event.title}"></div>
                `;
            }

            // Add to event list
            document.querySelector('.event-list').innerHTML += `
                <div class="event-item">
                    <div class="event-date">${formatDate(event.date)}</div>
                    <h4>${event.title}</h4>
                    <p>${event.description}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Gear Comparison Functionality
function initializeGearComparison() {
    const priceRange = document.getElementById('priceRange');
    const priceDisplay = document.querySelector('.price-display');
    
    priceRange.addEventListener('input', () => {
        priceDisplay.textContent = `$0 - $${priceRange.value}`;
        filterProducts();
    });

    document.getElementById('gearCategory').addEventListener('change', filterProducts);
    
    loadProducts();
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        updateComparisonGrid(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function updateComparisonGrid(products) {
    const grid = document.querySelector('.comparison-grid');
    grid.innerHTML = products.map(product => `
        <div class="product-comparison-card" data-category="${product.category}" data-price="${product.price}">
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="product-specs">
                <div class="spec">
                    <span class="label">Price:</span>
                    <span class="value">$${product.price}</span>
                </div>
                <div class="spec">
                    <span class="label">Rating:</span>
                    <span class="value">${product.rating}/5</span>
                </div>
                <!-- Add more specs -->
            </div>
            <button class="compare-btn">Add to Compare</button>
        </div>
    `).join('');
}

function filterProducts() {
    const category = document.getElementById('gearCategory').value;
    const maxPrice = document.getElementById('priceRange').value;
    
    document.querySelectorAll('.product-comparison-card').forEach(card => {
        const showProduct = (category === 'all' || card.dataset.category === category) &&
                          parseFloat(card.dataset.price) <= maxPrice;
        
        card.style.display = showProduct ? 'block' : 'none';
    });
}

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

function getWeatherIcon(conditions) {
    const iconMap = {
        'clear': 'fa-sun',
        'partly cloudy': 'fa-cloud-sun',
        'cloudy': 'fa-cloud',
        'rain': 'fa-cloud-rain',
        'storm': 'fa-bolt',
        'snow': 'fa-snowflake'
    };
    
    return iconMap[conditions.toLowerCase()] || 'fa-sun';
}