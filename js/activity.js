// Activity Tracking System
document.addEventListener('DOMContentLoaded', function() {
    initializeActivityTracking();
    setupEventListeners();
    loadInitialData();
});

// Initialize activity tracking
async function initializeActivityTracking() {
    populateSpeciesDropdown();
    initializeLocationAutocomplete();
    setupPhotoUpload();
    initializeCharts();
    setDefaultDates();
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });

    // Form submissions
    document.getElementById('catchForm').addEventListener('submit', handleCatchSubmit);
    document.getElementById('tripForm').addEventListener('submit', handleTripSubmit);

    // Activity filters
    document.getElementById('activityType').addEventListener('change', filterActivities);
    document.getElementById('dateRange').addEventListener('change', handleDateRangeChange);
    document.getElementById('locationFilter').addEventListener('input', debounce(filterActivities, 500));
}

// Load initial data
async function loadInitialData() {
    try {
        const [stats, history] = await Promise.all([
            fetchUserStats(),
            fetchActivityHistory()
        ]);

        updateQuickStats(stats);
        renderActivityHistory(history);
        updateStatistics(stats);
    } catch (error) {
        showError('Failed to load activity data');
    }
}

// Populate species dropdown
function populateSpeciesDropdown() {
    const species = [
        'Bass - Largemouth',
        'Bass - Smallmouth',
        'Trout - Rainbow',
        'Trout - Brown',
        'Catfish',
        'Salmon',
        'Pike',
        'Walleye',
        'Crappie',
        'Bluegill'
    ];

    const select = document.getElementById('species');
    species.forEach(fish => {
        const option = document.createElement('option');
        option.value = fish.toLowerCase().replace(/\s+/g, '-');
        option.textContent = fish;
        select.appendChild(option);
    });
}

// Initialize location autocomplete
function initializeLocationAutocomplete() {
    // TODO: Implement location search with MapBox or similar service
    const catchLocation = document.getElementById('catchLocation');
    const tripLocation = document.getElementById('tripLocation');
    
    // Temporary basic autocomplete
    const locations = [
        'Lake Travis',
        'Lake Austin',
        'Colorado River',
        'Barton Creek',
        'Lady Bird Lake'
    ];

    [catchLocation, tripLocation].forEach(input => {
        input.addEventListener('input', function() {
            const value = this.value.toLowerCase();
            const matches = locations.filter(loc => 
                loc.toLowerCase().includes(value)
            );

            // TODO: Show autocomplete dropdown
            console.log('Matching locations:', matches);
        });
    });
}

// Setup photo upload
function setupPhotoUpload() {
    const uploadAreas = document.querySelectorAll('.photo-upload-area');
    
    uploadAreas.forEach(area => {
        const input = area.querySelector('input[type="file"]');
        const preview = area.querySelector('.photo-preview');

        area.addEventListener('click', () => input.click());
        area.addEventListener('dragover', e => {
            e.preventDefault();
            area.classList.add('dragover');
        });
        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });
        area.addEventListener('drop', e => {
            e.preventDefault();
            area.classList.remove('dragover');
            handleFiles(Array.from(e.dataTransfer.files), preview);
        });

        input.addEventListener('change', () => {
            handleFiles(Array.from(input.files), preview);
        });
    });
}

// Handle file uploads
function handleFiles(files, preview) {
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = e => {
                const div = document.createElement('div');
                div.className = 'preview-item';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <button class="remove-photo" title="Remove photo">
                        <i class="fas fa-times"></i>
                    </button>
                `;

                div.querySelector('.remove-photo').addEventListener('click', e => {
                    e.stopPropagation();
                    div.remove();
                });

                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Initialize charts
function initializeCharts() {
    // Catches over time chart
    new Chart(document.getElementById('catchesChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Catches',
                data: [],
                borderColor: '#3498db',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Trips chart
    new Chart(document.getElementById('tripsChart'), {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Hours Spent',
                data: [],
                backgroundColor: '#2ecc71'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Species distribution chart
    new Chart(document.getElementById('speciesChart'), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#f1c40f',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Set default dates
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('catchDate').value = today;
    document.getElementById('tripDate').value = today;
}

// Handle catch submission
async function handleCatchSubmit(e) {
    e.preventDefault();

    try {
        const formData = new FormData(e.target);
        const catchData = Object.fromEntries(formData.entries());
        
        // Add photos
        catchData.photos = Array.from(e.target.querySelector('.photo-preview').children)
            .map(div => div.querySelector('img').src);

        const response = await submitCatch(catchData);
        if (response.success) {
            showSuccess('Catch logged successfully!');
            e.target.reset();
            loadInitialData();
            
            // Check for achievements
            const achievements = await achievementSystem.checkAchievements(
                'current',
                'catches',
                response.totalCatches
            );
        }
    } catch (error) {
        showError('Failed to log catch');
    }
}

// Handle trip submission
async function handleTripSubmit(e) {
    e.preventDefault();

    try {
        const formData = new FormData(e.target);
        const tripData = Object.fromEntries(formData.entries());
        
        // Add photos
        tripData.photos = Array.from(e.target.querySelector('.photo-preview').children)
            .map(div => div.querySelector('img').src);

        const response = await submitTrip(tripData);
        if (response.success) {
            showSuccess('Trip logged successfully!');
            e.target.reset();
            loadInitialData();
            
            // Check for achievements
            const achievements = await achievementSystem.checkAchievements(
                'current',
                'trips',
                response.totalTrips
            );
        }
    } catch (error) {
        showError('Failed to log trip');
    }
}

// Submit catch to API
async function submitCatch(catchData) {
    const response = await fetch('/api/activities/catches', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(catchData)
    });

    if (!response.ok) {
        throw new Error('Failed to submit catch');
    }

    return response.json();
}

// Submit trip to API
async function submitTrip(tripData) {
    const response = await fetch('/api/activities/trips', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tripData)
    });

    if (!response.ok) {
        throw new Error('Failed to submit trip');
    }

    return response.json();
}

// Fetch user statistics
async function fetchUserStats() {
    const response = await fetch('/api/users/current/stats');
    if (!response.ok) {
        throw new Error('Failed to fetch user stats');
    }
    return response.json();
}

// Fetch activity history
async function fetchActivityHistory() {
    const response = await fetch('/api/activities/history');
    if (!response.ok) {
        throw new Error('Failed to fetch activity history');
    }
    return response.json();
}

// Update quick stats
function updateQuickStats(stats) {
    document.getElementById('totalCatches').textContent = stats.totalCatches;
    document.getElementById('totalTrips').textContent = stats.totalTrips;
    document.getElementById('totalAchievements').textContent = stats.achievements.length;
}

// Render activity history
function renderActivityHistory(activities) {
    const timeline = document.getElementById('activityTimeline');
    const template = document.getElementById('activityItemTemplate');
    
    timeline.innerHTML = '';
    
    activities.forEach(activity => {
        const clone = template.content.cloneNode(true);
        
        // Set icon based on activity type
        const icon = clone.querySelector('.activity-icon i');
        icon.className = `fas ${activity.type === 'catch' ? 'fa-fish' : 'fa-map-marked-alt'}`;

        // Set title and date
        clone.querySelector('.activity-title').textContent = 
            activity.type === 'catch' 
                ? `Caught a ${activity.species}`
                : `Fishing trip at ${activity.location}`;
        
        clone.querySelector('.activity-date').textContent = 
            formatDate(activity.date);

        // Set details
        const details = clone.querySelector('.activity-details');
        if (activity.type === 'catch') {
            details.innerHTML = `
                <p>Weight: ${activity.weight || 'Not recorded'}</p>
                <p>Length: ${activity.length || 'Not recorded'}</p>
                <p>Location: ${activity.location}</p>
            `;
        } else {
            details.innerHTML = `
                <p>Duration: ${formatDuration(activity.startTime, activity.endTime)}</p>
                <p>Weather: ${activity.weather}</p>
                <p>Water Conditions: ${activity.waterConditions}</p>
            `;
        }

        // Add photos
        const photos = clone.querySelector('.activity-photos');
        activity.photos?.forEach(photo => {
            const img = document.createElement('img');
            img.src = photo;
            img.alt = 'Activity photo';
            img.className = 'activity-photo';
            photos.appendChild(img);
        });

        timeline.appendChild(clone);
    });
}

// Update statistics
function updateStatistics(stats) {
    // Update charts
    updateCatchesChart(stats.catchesByDate);
    updateTripsChart(stats.tripsByMonth);
    updateSpeciesChart(stats.speciesDistribution);

    // Update summary statistics
    document.getElementById('commonSpecies').textContent = stats.mostCommonSpecies;
    document.getElementById('largestCatch').textContent = 
        `${stats.largestCatch.weight}lbs ${stats.largestCatch.species}`;
    document.getElementById('totalTime').textContent = 
        formatTotalTime(stats.totalFishingTime);
    document.getElementById('favoriteLocation').textContent = stats.favoriteLocation;

    // Update achievement progress
    updateAchievementProgress(stats.achievements);
}

// Update charts
function updateCatchesChart(data) {
    const chart = Chart.getChart('catchesChart');
    chart.data.labels = Object.keys(data);
    chart.data.datasets[0].data = Object.values(data);
    chart.update();
}

function updateTripsChart(data) {
    const chart = Chart.getChart('tripsChart');
    chart.data.labels = Object.keys(data);
    chart.data.datasets[0].data = Object.values(data);
    chart.update();
}

function updateSpeciesChart(data) {
    const chart = Chart.getChart('speciesChart');
    chart.data.labels = Object.keys(data);
    chart.data.datasets[0].data = Object.values(data);
    chart.update();
}

// Update achievement progress
function updateAchievementProgress(achievements) {
    const container = document.querySelector('.achievement-progress');
    container.innerHTML = achievements.map(achievement => `
        <div class="achievement-item">
            <div class="achievement-info">
                <span class="achievement-name">${achievement.title}</span>
                <span class="achievement-percent">${achievement.progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="fill" style="width: ${achievement.progress}%"></div>
            </div>
        </div>
    `).join('');
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatDuration(start, end) {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const hours = Math.round((endTime - startTime) / (1000 * 60 * 60));
    return `${hours} hour${hours === 1 ? '' : 's'}`;
}

function formatTotalTime(minutes) {
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'}`;
}

function switchTab(tabId) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update visible content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

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

function showError(message) {
    // TODO: Implement error display UI
    alert(message);
}

function showSuccess(message) {
    // TODO: Implement success display UI
    alert(message);
}