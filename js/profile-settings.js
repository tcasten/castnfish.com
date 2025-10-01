// Profile Settings Handler
document.addEventListener('DOMContentLoaded', function() {
    initializeSettings();
    setupEventListeners();
    populateTimezones();
});

// Initialize settings page
async function initializeSettings() {
    try {
        const userData = await fetchUserSettings();
        populateFormData(userData);
    } catch (error) {
        showError('Failed to load user settings');
    }
}

// Fetch user settings from API
async function fetchUserSettings() {
    const response = await fetch('/api/users/settings');
    if (!response.ok) {
        throw new Error('Failed to fetch user settings');
    }
    return response.json();
}

// Populate form data
function populateFormData(userData) {
    // Profile Information
    document.getElementById('displayName').value = userData.displayName;
    document.getElementById('email').value = userData.email;
    document.getElementById('location').value = userData.location || '';
    document.getElementById('bio').value = userData.bio || '';
    document.getElementById('website').value = userData.website || '';
    document.getElementById('avatarPreview').src = userData.avatar;

    // Privacy Settings
    document.getElementById('profileVisibility').checked = userData.privacy.isPublic;
    document.getElementById('showLocation').checked = userData.privacy.showLocation;
    document.getElementById('showActivity').checked = userData.privacy.showActivity;
    document.getElementById('showStats').checked = userData.privacy.showStats;

    // Notification Settings
    document.getElementById('emailEvents').checked = userData.notifications.emailEvents;
    document.getElementById('emailMessages').checked = userData.notifications.emailMessages;
    document.getElementById('emailComments').checked = userData.notifications.emailComments;
    document.getElementById('pushEvents').checked = userData.notifications.pushEvents;
    document.getElementById('pushMessages').checked = userData.notifications.pushMessages;

    // Preferences
    document.getElementById('measurementSystem').value = userData.preferences.measurementSystem;
    document.getElementById('dateFormat').value = userData.preferences.dateFormat;
    document.getElementById('language').value = userData.preferences.language;
    document.getElementById('timezone').value = userData.preferences.timezone;
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.settings-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(e.target.dataset.section);
        });
    });

    // Avatar upload
    const uploadButton = document.getElementById('uploadAvatar');
    const avatarInput = document.getElementById('avatarInput');
    
    uploadButton.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', handleAvatarChange);

    // Form submissions
    document.getElementById('profileForm').addEventListener('submit', handleSubmit);
    document.getElementById('privacyForm').addEventListener('submit', handleSubmit);
    document.getElementById('notificationsForm').addEventListener('submit', handleSubmit);
    document.getElementById('preferencesForm').addEventListener('submit', handleSubmit);

    // Save button
    document.getElementById('saveButton').addEventListener('click', saveAllSettings);

    // Cancel button
    document.getElementById('cancelButton').addEventListener('click', () => {
        if (confirm('Are you sure? All unsaved changes will be lost.')) {
            window.location.href = '/community/profile';
        }
    });
}

// Switch settings section
function switchSection(sectionId) {
    // Update navigation
    document.querySelectorAll('.settings-nav a').forEach(link => {
        link.classList.toggle('active', link.dataset.section === sectionId);
    });

    // Update section visibility
    document.querySelectorAll('.settings-section').forEach(section => {
        section.classList.toggle('active', section.id === `${sectionId}Section`);
    });
}

// Handle avatar change
async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
        try {
            // Preview image
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('avatarPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);

            // Upload to server
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await fetch('/api/users/avatar', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload avatar');
            }
        } catch (error) {
            showError('Failed to update profile picture');
            // Revert preview
            document.getElementById('avatarPreview').src = 
                document.getElementById('avatarPreview').dataset.originalSrc;
        }
    }
}

// Save all settings
async function saveAllSettings() {
    try {
        const settings = {
            profile: getFormData('profileForm'),
            privacy: getFormData('privacyForm'),
            notifications: getFormData('notificationsForm'),
            preferences: getFormData('preferencesForm')
        };

        await saveSettings(settings);
        showSuccess('Settings saved successfully');
        window.location.href = '/community/profile';
    } catch (error) {
        showError('Failed to save settings');
    }
}

// Get form data
function getFormData(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        if (form.elements[key].type === 'checkbox') {
            data[key] = form.elements[key].checked;
        } else {
            data[key] = value;
        }
    });

    return data;
}

// Save settings to API
async function saveSettings(settings) {
    const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    });

    if (!response.ok) {
        throw new Error('Failed to save settings');
    }

    return response.json();
}

// Populate timezone dropdown
function populateTimezones() {
    const timezones = moment.tz.names();
    const select = document.getElementById('timezone');
    
    timezones.forEach(timezone => {
        const option = document.createElement('option');
        option.value = timezone;
        option.textContent = `${timezone} (${moment.tz(timezone).format('Z')})`;
        select.appendChild(option);
    });
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });

    // Validate email format
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput && emailInput.value && !isValidEmail(emailInput.value)) {
        isValid = false;
        emailInput.classList.add('error');
    }

    // Validate URL format
    const urlInput = form.querySelector('input[type="url"]');
    if (urlInput && urlInput.value && !isValidUrl(urlInput.value)) {
        isValid = false;
        urlInput.classList.add('error');
    }

    return isValid;
}

// Helper functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function showError(message) {
    // TODO: Implement error display UI
    alert(message);
}

function showSuccess(message) {
    // TODO: Implement success display UI
    alert(message);
}