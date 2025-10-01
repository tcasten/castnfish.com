// Event Creation Form Handler
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    initializeMap();
});

// Form initialization
function initializeForm() {
    populateStateDropdown();
    setDefaultDates();
    setupValidation();
}

// Populate US states dropdown
function populateStateDropdown() {
    const states = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
        'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
        'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
        'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
        'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
        'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
        'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
        'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
        'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
        'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
        'WI': 'Wisconsin', 'WY': 'Wyoming'
    };

    const stateSelect = document.getElementById('state');
    stateSelect.innerHTML = '<option value="">Select state</option>';
    
    Object.entries(states).forEach(([abbr, name]) => {
        const option = document.createElement('option');
        option.value = abbr;
        option.textContent = name;
        stateSelect.appendChild(option);
    });
}

// Set default dates
function setDefaultDates() {
    const today = new Date();
    const eventDateInput = document.getElementById('eventDate');
    const registrationDeadlineInput = document.getElementById('registrationDeadline');

    // Set min date to today
    const minDate = today.toISOString().split('T')[0];
    eventDateInput.min = minDate;
    registrationDeadlineInput.min = minDate;

    // Set default event date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    eventDateInput.value = tomorrow.toISOString().split('T')[0];

    // Update registration deadline when event date changes
    eventDateInput.addEventListener('change', function() {
        const eventDate = new Date(this.value);
        const deadline = new Date(eventDate);
        deadline.setDate(deadline.getDate() - 1);
        registrationDeadlineInput.value = deadline.toISOString().split('T')[0];
        registrationDeadlineInput.max = eventDate.toISOString().split('T')[0];
    });
}

// Setup form validation
function setupValidation() {
    const form = document.getElementById('createEventForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const formData = getFormData();
            try {
                await submitEvent(formData);
                window.location.href = '/community/events';
            } catch (error) {
                showError('Failed to create event. Please try again.');
            }
        }
    });
}

// Validate form inputs
function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });

    // Validate ZIP code format
    const zipCode = document.getElementById('zipCode');
    if (zipCode.value && !(/^\d{5}$/.test(zipCode.value))) {
        isValid = false;
        zipCode.classList.add('error');
    }

    return isValid;
}

// Get form data as object
function getFormData() {
    const form = document.getElementById('createEventForm');
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Combine date and time
    const date = new Date(data.date + 'T' + data.time);
    data.datetime = date.toISOString();
    delete data.date;
    delete data.time;

    return data;
}

// Submit event to API
async function submitEvent(eventData) {
    const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    });

    if (!response.ok) {
        throw new Error('Failed to create event');
    }

    return response.json();
}

// Initialize map
function initializeMap() {
    // Initialize Mapbox map
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';
    const map = new mapboxgl.Map({
        container: 'mapPreview',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-97.7431, 30.2672], // Default to Austin, TX
        zoom: 12
    });

    // Add marker for selected location
    const marker = new mapboxgl.Marker();

    // Update map when address is entered
    const addressInputs = ['address', 'city', 'state', 'zipCode'];
    addressInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', debounce(updateMap, 1000));
    });

    async function updateMap() {
        const address = getFullAddress();
        if (!address) return;

        try {
            const coordinates = await geocodeAddress(address);
            map.setCenter(coordinates);
            marker.setLngLat(coordinates).addTo(map);
        } catch (error) {
            console.error('Geocoding failed:', error);
        }
    }
}

// Get full address from form
function getFullAddress() {
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zipCode = document.getElementById('zipCode').value;

    if (!city || !state) return null;

    return `${address} ${city}, ${state} ${zipCode}`;
}

// Geocode address using Mapbox
async function geocodeAddress(address) {
    const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
    );

    if (!response.ok) {
        throw new Error('Geocoding failed');
    }

    const data = await response.json();
    if (!data.features.length) {
        throw new Error('No results found');
    }

    return data.features[0].center;
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show error message
function showError(message) {
    // TODO: Implement error display UI
    alert(message);
}