// Event Details Page Handler
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    const eventId = getEventIdFromUrl();
    if (!eventId) {
        showError('Event not found');
        return;
    }

    try {
        const event = await fetchEventDetails(eventId);
        renderEventDetails(event);
        initializeMap(event.location);
        setupEventListeners(event);
    } catch (error) {
        showError('Failed to load event details');
    }
}

// Get event ID from URL
function getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch event details from API
async function fetchEventDetails(eventId) {
    const response = await fetch(`/api/events/${eventId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch event details');
    }
    return response.json();
}

// Render event details
function renderEventDetails(event) {
    // Update page title
    document.title = `${event.title} | CastnFish Community`;

    // Update meta description
    document.querySelector('meta[name="description"]').content = 
        `Join ${event.title} at ${event.location.name} on ${formatDate(event.datetime)}`;

    // Update hero section
    document.querySelector('.event-type-badge span').textContent = event.type;
    document.querySelector('.event-title').textContent = event.title;
    document.querySelector('.event-date').textContent = formatDate(event.datetime);
    document.querySelector('.event-location').textContent = event.location.name;
    document.querySelector('.event-attendance').textContent = 
        `${event.attendees.length} attending`;

    // Update main content
    document.querySelector('.description-content').textContent = event.description;
    document.querySelector('.rules-content').textContent = event.rules || 'No specific rules provided.';

    // Update location details
    document.querySelector('.venue-name').textContent = event.location.name;
    document.querySelector('.venue-address').textContent = formatAddress(event.location);

    // Update registration card
    updateRegistrationCard(event);

    // Update organizer info
    updateOrganizerInfo(event.organizer);

    // Render attendees
    renderAttendees(event.attendees);

    // Render discussion
    renderDiscussion(event.discussion);
}

// Initialize map
function initializeMap(location) {
    mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';
    const map = new mapboxgl.Map({
        container: 'eventMap',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [location.longitude, location.latitude],
        zoom: 13
    });

    // Add marker
    new mapboxgl.Marker()
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);
}

// Update registration card
function updateRegistrationCard(event) {
    const spotsLeft = event.maxParticipants 
        ? `${event.maxParticipants - event.attendees.length} spots left`
        : 'Unlimited spots';
    
    document.querySelector('.spots-left').textContent = spotsLeft;
    document.querySelector('.deadline-date').textContent = 
        formatDate(event.registrationDeadline);

    const registerButton = document.getElementById('registerButton');
    if (isRegistrationClosed(event)) {
        registerButton.disabled = true;
        registerButton.textContent = 'Registration Closed';
    }
}

// Update organizer info
function updateOrganizerInfo(organizer) {
    document.querySelector('.organizer-avatar').src = organizer.avatar;
    document.querySelector('.organizer-name').textContent = organizer.name;
    document.querySelector('.organizer-events').textContent = 
        `${organizer.eventCount} events organized`;
}

// Render attendees
function renderAttendees(attendees) {
    const grid = document.querySelector('.attendees-grid');
    grid.innerHTML = attendees.map(attendee => `
        <div class="attendee-avatar" title="${attendee.name}">
            <img src="${attendee.avatar}" alt="${attendee.name}'s avatar">
        </div>
    `).join('');
}

// Render discussion
function renderDiscussion(discussion) {
    const thread = document.querySelector('.discussion-thread');
    thread.innerHTML = discussion.map(comment => `
        <div class="comment">
            <div class="comment-header">
                <img src="${comment.author.avatar}" alt="${comment.author.name}'s avatar">
                <div class="comment-meta">
                    <span class="author-name">${comment.author.name}</span>
                    <span class="comment-date">${formatDate(comment.datetime)}</span>
                </div>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners(event) {
    // Registration button
    const registerButton = document.getElementById('registerButton');
    registerButton.addEventListener('click', () => showRegistrationModal(event));

    // Registration form
    const registrationForm = document.getElementById('registrationForm');
    registrationForm.addEventListener('submit', (e) => handleRegistration(e, event));

    // Comment form
    const commentForm = document.querySelector('.comment-form');
    commentForm.addEventListener('submit', handleCommentSubmission);

    // Share buttons
    setupShareButtons(event);
}

// Show registration modal
function showRegistrationModal(event) {
    const modal = document.getElementById('registrationModal');
    modal.style.display = 'block';
}

// Handle registration submission
async function handleRegistration(e, event) {
    e.preventDefault();

    const notes = document.getElementById('additionalNotes').value;
    try {
        await submitRegistration(event.id, notes);
        window.location.reload();
    } catch (error) {
        showError('Failed to submit registration');
    }
}

// Submit registration to API
async function submitRegistration(eventId, notes) {
    const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }

    return response.json();
}

// Handle comment submission
async function handleCommentSubmission(e) {
    e.preventDefault();

    const content = e.target.querySelector('textarea').value;
    if (!content.trim()) return;

    try {
        const eventId = getEventIdFromUrl();
        await submitComment(eventId, content);
        window.location.reload();
    } catch (error) {
        showError('Failed to post comment');
    }
}

// Submit comment to API
async function submitComment(eventId, content) {
    const response = await fetch(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
    });

    if (!response.ok) {
        throw new Error('Comment submission failed');
    }

    return response.json();
}

// Setup share buttons
function setupShareButtons(event) {
    const shareButtons = document.querySelector('.share-buttons');
    
    shareButtons.querySelector('.facebook').addEventListener('click', () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
    });

    shareButtons.querySelector('.twitter').addEventListener('click', () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`);
    });

    shareButtons.querySelector('.linkedin').addEventListener('click', () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`);
    });

    shareButtons.querySelector('.copy-link').addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
    });
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function formatAddress(location) {
    return `${location.address}, ${location.city}, ${location.state} ${location.zipCode}`;
}

function isRegistrationClosed(event) {
    const now = new Date();
    const deadline = new Date(event.registrationDeadline);
    return now > deadline || 
           (event.maxParticipants && event.attendees.length >= event.maxParticipants);
}

function showError(message) {
    // TODO: Implement error display UI
    alert(message);
}

function showToast(message) {
    // TODO: Implement toast notification UI
    alert(message);
}