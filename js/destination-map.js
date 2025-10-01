// Destinations Map Initialization
let map;
let markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('destinationsMap'), {
    center: { lat: 39.8283, lng: -98.5795 }, // Center of US
    zoom: 4,
    styles: mapStyles
  });

  // Load and place markers
  loadDestinations();

  // Initialize filters
  initFilters();
}

// Custom map styles
const mapStyles = [
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      { color: "#193341" }
    ]
  },
  // Add more custom styles...
];

// Load destinations data and create markers
function loadDestinations() {
  // This would typically fetch from an API
  const destinations = [
    {
      name: "Lake Tahoe",
      position: { lat: 39.0968, lng: -120.0324 },
      type: ["fishing", "boating"],
      species: ["trout", "bass"],
      season: ["summer", "fall"]
    },
    // Add more destinations...
  ];

  destinations.forEach(createMarker);
  updateLocationList(destinations);
}

// Create map marker for destination
function createMarker(destination) {
  const marker = new google.maps.Marker({
    position: destination.position,
    map: map,
    title: destination.name,
    icon: {
      url: `/images/explore/markers/${destination.type[0]}.png`,
      scaledSize: new google.maps.Size(30, 30)
    }
  });

  const infoWindow = new google.maps.InfoWindow({
    content: createInfoWindowContent(destination)
  });

  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });

  markers.push({ marker, data: destination });
}

// Create info window HTML content
function createInfoWindowContent(destination) {
  return `
    <div class="map-info-window">
      <h3>${destination.name}</h3>
      <div class="info-meta">
        <p><i class="fas fa-fish"></i> ${destination.species.join(', ')}</p>
        <p><i class="fas fa-calendar"></i> Best: ${destination.season.join(', ')}</p>
      </div>
      <a href="/explore/destinations/${destination.name.toLowerCase().replace(/\s+/g, '-')}" class="btn-explore">
        View Details
      </a>
    </div>
  `;
}

// Update location list in sidebar
function updateLocationList(destinations) {
  const locationList = document.querySelector('.location-list');
  locationList.innerHTML = destinations.map(dest => `
    <div class="location-item" data-name="${dest.name}">
      <h4>${dest.name}</h4>
      <div class="location-meta">
        <span><i class="fas fa-fish"></i> ${dest.species.join(', ')}</span>
        <span><i class="fas fa-calendar"></i> ${dest.season.join(', ')}</span>
      </div>
    </div>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.location-item').forEach(item => {
    item.addEventListener('click', () => {
      const destination = destinations.find(d => d.name === item.dataset.name);
      map.panTo(destination.position);
      map.setZoom(12);
    });
  });
}

// Initialize and handle filters
function initFilters() {
  const filterInputs = document.querySelectorAll('.filter-group input[type="checkbox"]');
  
  filterInputs.forEach(input => {
    input.addEventListener('change', () => {
      const activeFilters = getActiveFilters();
      filterMarkers(activeFilters);
    });
  });
}

// Get currently active filters
function getActiveFilters() {
  const filters = {
    activities: [],
    species: [],
    seasons: [],
    experience: []
  };

  document.querySelectorAll('.filter-group input:checked').forEach(input => {
    const filterType = input.closest('.filter-group').querySelector('label').textContent.toLowerCase();
    if (filterType.includes('activity')) filters.activities.push(input.value);
    else if (filterType.includes('species')) filters.species.push(input.value);
    else if (filterType.includes('season')) filters.seasons.push(input.value);
    else if (filterType.includes('experience')) filters.experience.push(input.value);
  });

  return filters;
}

// Filter visible markers based on selected criteria
function filterMarkers(filters) {
  markers.forEach(({ marker, data }) => {
    const visible = (
      (filters.activities.length === 0 || data.type.some(t => filters.activities.includes(t))) &&
      (filters.species.length === 0 || data.species.some(s => filters.species.includes(s))) &&
      (filters.seasons.length === 0 || data.season.some(s => filters.seasons.includes(s)))
    );
    marker.setVisible(visible);
  });
}

// Search functionality
const searchInput = document.getElementById('destinationSearch');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    markers.forEach(({ marker, data }) => {
      const visible = data.name.toLowerCase().includes(searchTerm) ||
                     data.species.some(s => s.toLowerCase().includes(searchTerm)) ||
                     data.type.some(t => t.toLowerCase().includes(searchTerm));
      marker.setVisible(visible);
    });
  });
}

// Initialize map when API loads
google.maps.event.addDomListener(window, 'load', initMap);