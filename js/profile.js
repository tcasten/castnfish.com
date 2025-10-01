// Profile Page Handler
document.addEventListener('DOMContentLoaded', function() {
    initializeProfile();
    setupEventListeners();
});

// Initialize profile page
async function initializeProfile() {
    try {
        const userId = getUserIdFromUrl();
        const userData = await fetchUserData(userId);
        
        renderProfileInfo(userData);
        renderStats(userData.stats);
        renderAchievements(userData.achievements);
        renderActivityFeed(userData.activities);
        renderFavoriteSpots(userData.favoriteSpots);
        renderGear(userData.gear);
        renderBadges(userData.badges);
        renderUpcomingEvents(userData.upcomingEvents);
    } catch (error) {
        showError('Failed to load profile data');
    }
}

// Get user ID from URL
function getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'current'; // 'current' for logged-in user
}

// Fetch user data from API
async function fetchUserData(userId) {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    return response.json();
}

// Render profile information
function renderProfileInfo(user) {
    // Update meta tags
    document.title = `${user.displayName} | CastnFish Community`;
    document.querySelector('meta[name="description"]').content = 
        `${user.displayName}'s fishing profile on CastnFish - View their catches, achievements, and more.`;

    // Update profile header
    document.getElementById('profileAvatar').src = user.avatar;
    document.querySelector('.profile-name').textContent = user.displayName;
    document.querySelector('.profile-location span').textContent = user.location || 'Location not set';
    document.querySelector('.profile-join-date span').textContent = 
        `Member since ${formatDate(user.joinDate)}`;
    document.getElementById('aboutContent').textContent = user.bio || 'No bio yet';

    // Set cover photo if exists
    if (user.coverPhoto) {
        document.querySelector('.profile-cover').style.backgroundImage = 
            `url(${user.coverPhoto})`;
    }

    // Show/hide edit button for own profile
    const editButton = document.querySelector('.profile-actions .btn-secondary');
    editButton.style.display = user.isOwnProfile ? 'block' : 'none';
}

// Render fishing stats
function renderStats(stats) {
    const statCards = document.querySelectorAll('.stat-card .stat-value');
    statCards[0].textContent = stats.totalCatches;
    statCards[1].textContent = stats.speciesCaught;
    statCards[2].textContent = stats.fishingTrips;
    statCards[3].textContent = stats.eventsAttended;
}

// Render achievements
function renderAchievements(achievements) {
    const grid = document.getElementById('achievementsGrid');
    const template = document.getElementById('achievementTemplate');

    grid.innerHTML = '';
    achievements.forEach(achievement => {
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.achievement-icon i').className = 
            `fas ${achievement.icon}`;
        clone.querySelector('.achievement-title').textContent = 
            achievement.title;
        clone.querySelector('.achievement-description').textContent = 
            achievement.description;
        
        const progressBar = clone.querySelector('.progress-bar');
        progressBar.innerHTML = `<div style="width: ${achievement.progress}%"></div>`;
        clone.querySelector('.progress-text').textContent = 
            `${achievement.progress}%`;

        grid.appendChild(clone);
    });
}

// Render activity feed
function renderActivityFeed(activities) {
    const feed = document.getElementById('activityFeed');
    const template = document.getElementById('activityTemplate');

    feed.innerHTML = '';
    activities.forEach(activity => {
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.activity-icon i').className = 
            `fas ${activity.icon}`;
        clone.querySelector('.activity-text').textContent = 
            activity.text;
        clone.querySelector('.activity-date').textContent = 
            formatDate(activity.date);

        feed.appendChild(clone);
    });
}

// Render favorite spots
function renderFavoriteSpots(spots) {
    const list = document.getElementById('favoriteSpots');
    const template = document.getElementById('spotTemplate');

    list.innerHTML = '';
    spots.forEach(spot => {
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.spot-image').src = spot.image;
        clone.querySelector('.spot-name').textContent = spot.name;
        clone.querySelector('.spot-location').textContent = spot.location;

        list.appendChild(clone);
    });
}

// Render fishing gear
function renderGear(gear) {
    const list = document.getElementById('gearList');
    const template = document.getElementById('gearTemplate');

    list.innerHTML = '';
    gear.forEach(item => {
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.gear-image').src = item.image;
        clone.querySelector('.gear-name').textContent = item.name;
        clone.querySelector('.gear-category').textContent = item.category;

        list.appendChild(clone);
    });
}

// Render badges
function renderBadges(badges) {
    const grid = document.getElementById('badgesGrid');
    const template = document.getElementById('badgeTemplate');

    grid.innerHTML = '';
    badges.forEach(badge => {
        const clone = template.content.cloneNode(true);
        
        clone.querySelector('.badge-icon i').className = 
            `fas ${badge.icon}`;
        clone.querySelector('.badge-name').textContent = badge.name;
        clone.querySelector('.badge-description').textContent = 
            badge.description;

        grid.appendChild(clone);
    });
}

// Render upcoming events
function renderUpcomingEvents(events) {
    const list = document.getElementById('upcomingEvents');
    list.innerHTML = events.map(event => `
        <div class="event-item">
            <div class="event-date">${formatDate(event.date)}</div>
            <div class="event-details">
                <h4>${event.title}</h4>
                <p>${event.location}</p>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Avatar upload button
    const editAvatarBtn = document.querySelector('.edit-avatar');
    if (editAvatarBtn) {
        editAvatarBtn.addEventListener('click', handleAvatarUpload);
    }
}

// Handle avatar upload
async function handleAvatarUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('avatar', file);

                const response = await fetch('/api/users/avatar', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to upload avatar');
                }

                const data = await response.json();
                document.getElementById('profileAvatar').src = data.avatarUrl;
            } catch (error) {
                showError('Failed to update profile picture');
            }
        }
    });

    input.click();
}

// Helper functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function showError(message) {
    // TODO: Implement error display UI
    alert(message);
}