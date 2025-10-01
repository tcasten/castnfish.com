// Trip Report Form functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeReportForm();
});

function initializeReportForm() {
    setupMap();
    setupPhotoUploads();
    setupCatchesManagement();
    setupFormPreview();
    setupWeatherData();
    setupFormValidation();
}

// Map Setup
function setupMap() {
    const map = L.map('locationMap').setView([30.2672, -97.7431], 10); // Default to Austin, TX

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marker;

    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        document.getElementById('locationLat').value = lat;
        document.getElementById('locationLng').value = lng;

        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng).addTo(map);
        }

        // Reverse geocode to get location name
        reverseGeocode(lat, lng);
    });
}

async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        document.getElementById('locationName').value = data.display_name;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
    }
}

// Photo Upload Management
function setupPhotoUploads() {
    const photoInputs = document.querySelectorAll('input[type="file"]');

    photoInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            if (!validatePhoto(file)) {
                e.target.value = '';
                return;
            }

            const placeholder = input.nextElementSibling;
            displayPhotoPreview(file, placeholder);

            // If this is the main photo, update the report preview
            if (input.name === 'mainPhoto') {
                updateReportPreview();
            }
        });
    });
}

function validatePhoto(file) {
    // Check file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file', 'error');
        return false;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return false;
    }

    return true;
}

function displayPhotoPreview(file, placeholder) {
    const reader = new FileReader();
    reader.onload = function(e) {
        placeholder.innerHTML = `
            <img src="${e.target.result}" alt="Preview" 
                style="width: 100%; height: 100%; object-fit: cover;">
        `;
    };
    reader.readAsDataURL(file);
}

// Catches Management
function setupCatchesManagement() {
    const container = document.getElementById('catchesContainer');
    const addButton = document.querySelector('.btn-add-catch');
    let catchCount = 1;

    addButton.addEventListener('click', () => {
        const newCatch = createCatchEntry(catchCount++);
        container.appendChild(newCatch);
    });

    container.addEventListener('click', e => {
        if (e.target.classList.contains('btn-remove-catch')) {
            e.target.closest('.catch-entry').remove();
        }
    });
}

function createCatchEntry(index) {
    const div = document.createElement('div');
    div.className = 'catch-entry';
    div.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Species</label>
                <select name="catches[${index}][species]" required>
                    <option value="">Select species</option>
                    <option value="bass">Bass</option>
                    <option value="trout">Trout</option>
                    <option value="catfish">Catfish</option>
                    <option value="crappie">Crappie</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Weight (lbs)</label>
                <input type="number" name="catches[${index}][weight]" 
                    step="0.1" min="0">
            </div>
            <div class="form-group">
                <label>Length (in)</label>
                <input type="number" name="catches[${index}][length]" 
                    step="0.5" min="0">
            </div>
            <button type="button" class="btn-remove-catch">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="form-group">
            <label>Photo</label>
            <div class="photo-upload">
                <input type="file" name="catches[${index}][photo]" accept="image/*">
                <div class="upload-placeholder">
                    <i class="fas fa-camera"></i>
                    <span>Add Photo</span>
                </div>
            </div>
        </div>
    `;

    return div;
}

// Form Preview
function setupFormPreview() {
    const titleInput = document.getElementById('reportTitle');
    const locationInput = document.getElementById('locationName');
    const dateInput = document.getElementById('tripDate');

    [titleInput, locationInput, dateInput].forEach(input => {
        input.addEventListener('input', updateReportPreview);
    });
}

function updateReportPreview() {
    const title = document.getElementById('reportTitle').value || 'Your Trip Title';
    const location = document.getElementById('locationName').value || 'Location';
    const date = document.getElementById('tripDate').value || 'Date';

    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewLocation').innerHTML = 
        `<i class="fas fa-map-marker-alt"></i> ${location}`;
    document.getElementById('previewDate').innerHTML = 
        `<i class="fas fa-calendar"></i> ${formatDate(date)}`;
}

// Weather Data
function setupWeatherData() {
    const locationInput = document.getElementById('locationName');
    let weatherTimeout;

    locationInput.addEventListener('input', () => {
        clearTimeout(weatherTimeout);
        weatherTimeout = setTimeout(() => {
            fetchWeatherData(locationInput.value);
        }, 500);
    });
}

async function fetchWeatherData(location) {
    try {
        const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
        const data = await response.json();
        updateWeatherDisplay(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

function updateWeatherDisplay(data) {
    const weatherData = document.querySelector('.weather-data');
    
    const items = weatherData.querySelectorAll('.weather-item');
    items[0].querySelector('.value').textContent = `${data.temperature}°F`;
    items[1].querySelector('.value').textContent = `${data.windSpeed} mph`;
    items[2].querySelector('.value').textContent = `${data.humidity}%`;
    items[3].querySelector('.value').textContent = `${data.pressure} inHg`;
}

// Form Validation and Submission
function setupFormValidation() {
    const form = document.getElementById('tripReportForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const formData = new FormData(form);
            await submitReport(formData);
            
            window.location.href = '/community/reports';
        } catch (error) {
            console.error('Error submitting report:', error);
            showNotification('Error submitting report. Please try again.', 'error');
        }
    });
}

function validateForm() {
    const required = [
        { id: 'reportTitle', message: 'Please enter a title' },
        { id: 'tripDate', message: 'Please select a date' },
        { id: 'locationName', message: 'Please enter a location' },
        { id: 'reportContent', message: 'Please enter trip details' }
    ];

    for (const field of required) {
        const element = document.getElementById(field.id);
        if (!element.value.trim()) {
            showNotification(field.message, 'error');
            element.focus();
            return false;
        }
    }

    // Validate catches
    const catches = document.querySelectorAll('.catch-entry');
    for (const catch_ of catches) {
        const species = catch_.querySelector('select[name*="[species]"]');
        if (!species.value) {
            showNotification('Please select species for all catches', 'error');
            species.focus();
            return false;
        }
    }

    return true;
}

async function submitReport(formData) {
    const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error('Failed to submit report');
    }

    return response.json();
}

// Helper Functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'error') {
    // Implementation depends on your notification system
    console.log(`${type}: ${message}`);
}