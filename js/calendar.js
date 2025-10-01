// Event Calendar functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    setupEventListeners();
});

// Global variables
let currentDate = new Date();
let currentView = 'month';
let events = []; // Will be populated from API

// Initialize calendar components
function initializeCalendar() {
    updateMonthDisplay();
    generateMiniCalendar();
    generateMainCalendar();
    loadEvents();
}

// Update month display in the sidebar
function updateMonthDisplay() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const monthYear = document.querySelector('.month-selector h2');
    monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
}

// Generate mini calendar in sidebar
function generateMiniCalendar() {
    const miniCalendar = document.querySelector('.mini-calendar');
    const today = new Date();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Clear existing content
    miniCalendar.innerHTML = '';

    // Add day labels
    const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayLabels.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day-label';
        dayLabel.textContent = day;
        miniCalendar.appendChild(dayLabel);
    });

    // Add padding days
    let startPadding = firstDay.getDay();
    for(let i = 0; i < startPadding; i++) {
        const paddingDay = document.createElement('div');
        paddingDay.className = 'day padding';
        miniCalendar.appendChild(paddingDay);
    }

    // Add month days
    for(let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        dayElement.textContent = i;

        // Check if it's today
        if(today.getDate() === i && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear()) {
            dayElement.classList.add('today');
        }

        // Check if day has events
        if(hasEvents(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))) {
            dayElement.classList.add('has-events');
        }

        dayElement.addEventListener('click', () => selectDate(i));
        miniCalendar.appendChild(dayElement);
    }
}

// Generate main calendar grid
function generateMainCalendar() {
    const calendarGrid = document.querySelector('.calendar-grid');
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Clear existing content
    calendarGrid.innerHTML = '';

    // Add day labels
    const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayLabels.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'day-label';
        dayLabel.textContent = day;
        calendarGrid.appendChild(dayLabel);
    });

    // Add padding days from previous month
    let startPadding = firstDay.getDay();
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    for(let i = startPadding - 1; i >= 0; i--) {
        const paddingDay = document.createElement('div');
        paddingDay.className = 'day other-month';
        paddingDay.textContent = prevMonthLastDay.getDate() - i;
        calendarGrid.appendChild(paddingDay);
    }

    // Add current month days
    for(let i = 1; i <= lastDay.getDate(); i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        const dateHeader = document.createElement('div');
        dateHeader.className = 'date-header';
        dateHeader.textContent = i;
        dayElement.appendChild(dateHeader);

        // Add event container
        const eventContainer = document.createElement('div');
        eventContainer.className = 'event-container';
        
        // Add any events for this day
        const dayEvents = getEventsForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        dayEvents.forEach(event => {
            const eventElement = createEventElement(event);
            eventContainer.appendChild(eventElement);
        });

        dayElement.appendChild(eventContainer);
        calendarGrid.appendChild(dayElement);
    }

    // Add padding days for next month
    const endPadding = 42 - (startPadding + lastDay.getDate()); // 42 = 6 rows × 7 days
    for(let i = 1; i <= endPadding; i++) {
        const paddingDay = document.createElement('div');
        paddingDay.className = 'day other-month';
        paddingDay.textContent = i;
        calendarGrid.appendChild(paddingDay);
    }
}

// Create event element for calendar
function createEventElement(event) {
    const eventElement = document.createElement('div');
    eventElement.className = `event-item ${event.type}`;
    eventElement.textContent = event.title;
    eventElement.title = `${event.title}\n${event.time}`;
    
    eventElement.addEventListener('click', () => showEventDetails(event));
    
    return eventElement;
}

// Setup event listeners
function setupEventListeners() {
    // Month navigation
    document.querySelector('.btn-prev').addEventListener('click', () => {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
        updateCalendar();
    });

    document.querySelector('.btn-next').addEventListener('click', () => {
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
        updateCalendar();
    });

    // View switching
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => {
            currentView = button.dataset.view;
            updateCalendarView();
        });
    });

    // Today button
    document.querySelector('.btn-today').addEventListener('click', () => {
        currentDate = new Date();
        updateCalendar();
    });

    // Event filters
    document.querySelectorAll('.event-filters input').forEach(filter => {
        filter.addEventListener('change', updateEventVisibility);
    });

    // Location filter
    const locationInput = document.querySelector('.location-search input');
    let timeout = null;
    locationInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            filterEventsByLocation(locationInput.value);
        }, 500);
    });

    // Distance selector
    document.querySelector('.distance-select').addEventListener('change', (e) => {
        updateDistanceFilter(e.target.value);
    });
}

// Load events from API
async function loadEvents() {
    try {
        // This would be replaced with actual API call
        const response = await fetch('/api/events');
        events = await response.json();
        updateCalendar();
    } catch (error) {
        console.error('Error loading events:', error);
        // Show user-friendly error message
        showNotification('Error loading events. Please try again later.');
    }
}

// Update calendar when data or view changes
function updateCalendar() {
    updateMonthDisplay();
    generateMiniCalendar();
    generateMainCalendar();
    updateEventList();
}

// Update calendar view based on selected view type
function updateCalendarView() {
    const calendarGrid = document.querySelector('.calendar-grid');
    const eventsList = document.querySelector('.upcoming-events');

    // Update active view button
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === currentView);
    });

    // Show/hide appropriate view
    switch(currentView) {
        case 'month':
            calendarGrid.style.display = 'grid';
            eventsList.style.display = 'none';
            generateMainCalendar();
            break;
        case 'week':
            calendarGrid.style.display = 'none';
            eventsList.style.display = 'block';
            generateWeekView();
            break;
        case 'list':
            calendarGrid.style.display = 'none';
            eventsList.style.display = 'block';
            generateListView();
            break;
    }
}

// Generate week view
function generateWeekView() {
    // Implementation for week view
}

// Generate list view
function generateListView() {
    // Implementation for list view
}

// Update upcoming events list
function updateEventList() {
    const eventsList = document.querySelector('.events-list');
    eventsList.innerHTML = ''; // Clear existing events

    const upcomingEvents = getUpcomingEvents();
    upcomingEvents.forEach(event => {
        const eventCard = createEventCard(event);
        eventsList.appendChild(eventCard);
    });
}

// Create event card for list view
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = `event-card ${event.type}`;
    
    // Card HTML structure
    card.innerHTML = `
        <div class="event-date">
            <span class="date">${event.date.getDate()}</span>
            <span class="month">${event.date.toLocaleString('default', { month: 'short' })}</span>
        </div>
        <div class="event-content">
            <h4>${event.title}</h4>
            <div class="event-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${event.location}</span>
                <span><i class="fas fa-clock"></i> ${event.time}</span>
            </div>
            <p>${event.description}</p>
            <div class="event-footer">
                <div class="participants">
                    <div class="avatar-group">
                        ${event.participants.slice(0, 3).map(p => 
                            `<img src="${p.avatar}" alt="${p.name}">`
                        ).join('')}
                        ${event.participants.length > 3 ? 
                            `<span class="more-participants">+${event.participants.length - 3}</span>` : 
                            ''}
                    </div>
                    <span>${event.spotsLeft} spots left</span>
                </div>
                <a href="/community/events/${event.id}" class="btn-details">View Details</a>
            </div>
        </div>
    `;

    return card;
}

// Helper functions
function hasEvents(date) {
    return events.some(event => isSameDay(event.date, date));
}

function getEventsForDate(date) {
    return events.filter(event => isSameDay(event.date, date));
}

function getUpcomingEvents() {
    const now = new Date();
    return events
        .filter(event => event.date >= now)
        .sort((a, b) => a.date - b.date)
        .slice(0, 5);
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Show event details modal
function showEventDetails(event) {
    // Implementation for event details modal
}

// Update event visibility based on filters
function updateEventVisibility() {
    const selectedTypes = Array.from(document.querySelectorAll('.event-filters input:checked'))
        .map(input => input.value);
    
    document.querySelectorAll('.event-item').forEach(eventElement => {
        const eventType = eventElement.classList[1];
        eventElement.style.display = selectedTypes.includes(eventType) ? 'block' : 'none';
    });
}

// Filter events by location
function filterEventsByLocation(location) {
    // Implementation for location filtering
}

// Update distance filter
function updateDistanceFilter(distance) {
    // Implementation for distance filtering
}

// Show notification
function showNotification(message, type = 'error') {
    // Implementation for showing notifications
}

// Initialize calendar when document loads
document.addEventListener('DOMContentLoaded', initializeCalendar);