// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed header
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Header Background on Scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(30, 60, 114, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
        header.style.backdropFilter = 'none';
    }
});

// Form Handling
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
    };
    
    // Basic form validation
    if (!formData.name || !formData.email || !formData.message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    if (!isValidEmail(formData.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Simulate form submission (replace with actual form handling)
    showNotification('Thank you for your message! We will get back to you soon.', 'success');
    
    // Reset form
    document.getElementById('contactForm').reset();
    
    // In a real application, you would send this data to your server
    console.log('Form submitted:', formData);
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Add click handler for close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
    }
    
    .notification-close:hover {
        background-color: rgba(255,255,255,0.2);
    }
`;
document.head.appendChild(style);

// Animate elements on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.service-card, .gallery-item, .stat');
    const windowHeight = window.innerHeight;
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
}

// Initialize animation styles
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.service-card, .gallery-item, .stat');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Initial check
    animateOnScroll();
});

// Listen for scroll events
window.addEventListener('scroll', animateOnScroll);

// Gallery image modal (simple lightbox effect)
document.addEventListener('DOMContentLoaded', function() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const overlay = this.querySelector('.gallery-overlay');
            const title = overlay.querySelector('h4').textContent;
            const description = overlay.querySelector('p').textContent;
            
            // Create modal
            const modal = document.createElement('div');
            modal.className = 'gallery-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-image">🎣 Full Size Image</div>
                        <p>${description}</p>
                        <p>This is a placeholder for the full-size image. In a real implementation, you would display the actual fish photo here with details about the catch, location, and fishing techniques used.</p>
                    </div>
                </div>
            `;
            
            // Add modal styles
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            `;
            
            const modalContent = modal.querySelector('.modal-content');
            modalContent.style.cssText = `
                background: white;
                border-radius: 15px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease-out;
            `;
            
            document.body.appendChild(modal);
            
            // Close modal handlers
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.remove();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        });
    });
});

// Add modal animation styles
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: scale(0.8) translateY(50px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #eee;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #1e3c72;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s;
    }
    
    .modal-close:hover {
        background-color: #f0f0f0;
        color: #333;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .modal-image {
        background: linear-gradient(135deg, #4682B4, #87CEEB);
        color: white;
        padding: 3rem;
        border-radius: 10px;
        text-align: center;
        font-size: 2rem;
        margin-bottom: 1rem;
    }
    
    .modal-body p {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: #666;
    }
`;
document.head.appendChild(modalStyle);

// Amazon Affiliate Link Handler
function handleAffiliateLinks() {
    // Replace with your actual Amazon Associate ID
    const amazonAssociateId = 'castnfish-20'; // Replace with your actual ID
    
    const affiliateLinks = document.querySelectorAll('.affiliate-link');
    
    affiliateLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const category = this.getAttribute('data-category');
            const product = this.getAttribute('data-product');
            
            // Amazon search URLs with associate ID
            let amazonUrl = `https://amazon.com/s?k=${encodeURIComponent(getSearchTerm(category, product))}&tag=${amazonAssociateId}`;
            
            // Track the click (you could add analytics here)
            console.log(`Affiliate click: ${category} - ${product}`);
            
            // Open in new tab
            window.open(amazonUrl, '_blank');
        });
    });
}

// Generate search terms for Amazon
function getSearchTerm(category, product) {
    const searchTerms = {
        'boating': {
            'anchor': 'boat marine anchor',
            'gps': 'marine GPS navigation chartplotter',
            'safety': 'life jacket coast guard approved'
        },
        'fishing': {
            'rod-reel': 'fishing rod reel combo',
            'tackle': 'fishing tackle box lures',
            'fishfinder': 'fish finder sonar depth'
        },
        'watersports': {
            'wakeboard': 'wakeboard bindings water sports',
            'waterskis': 'water skis combo slalom',
            'tubes': 'towable tube water sports'
        },
        'camping': {
            'tent': 'waterproof camping tent',
            'cooking': 'portable camp stove cookware',
            'lighting': 'waterproof LED camping lantern',
            'coolers': 'marine cooler ice chest',
            'furniture': 'portable camping chair table',
            'power': 'portable power station camping'
        },
        'tools': {
            'marine-tools': 'marine boat tool kit',
            'cleaning': 'boat hull cleaner wax',
            'rod-repair': 'fishing rod repair kit',
            'batteries': 'marine deep cycle battery'
        },
        'apparel': {
            'sunglasses': 'polarized fishing sunglasses',
            'hats': 'UV protection fishing hat',
            'shirts': 'UPF fishing shirt',
            'gloves': 'fishing sun gloves',
            'shoes': 'water shoes boat deck'
        },
        'seasonal': {
            'fall-fishing': 'fall fishing gear lures',
            'boat-clearance': 'boat accessories clearance',
            'winter-prep': 'winter camping gear'
        }
    };
    
    return searchTerms[category]?.[product] || `${category} ${product}`;
}

// Enhanced navigation for new sections
function enhanceNavigation() {
    // Update smooth scrolling for new sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed header
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Activity section interactions
function enhanceActivitySections() {
    const featureHighlights = document.querySelectorAll('.feature-highlight');
    
    featureHighlights.forEach(highlight => {
        highlight.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 2px 8px rgba(30,60,114,0.3)';
        });
        
        highlight.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Shop link interactions
    const shopLinks = document.querySelectorAll('.shop-link');
    shopLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.color = '#2a5298';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.color = '#ff6b35';
        });
    });
}

// Membership links tracking
function trackMembershipClicks() {
    const membershipLinks = document.querySelectorAll('.org-link');
    
    membershipLinks.forEach(link => {
        link.addEventListener('click', function() {
            const orgName = this.closest('.org-item').querySelector('h4').textContent;
            console.log(`Membership link clicked: ${orgName}`);
            // You could add analytics tracking here
        });
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cast n Fish Water Recreation Hub loaded successfully!');
    
    // Initialize all new functionality
    handleAffiliateLinks();
    enhanceNavigation();
    enhanceActivitySections();
    trackMembershipClicks();
    
    // Add loading effect for images (placeholder enhancement)
    const placeholderImages = document.querySelectorAll('.placeholder-image');
    placeholderImages.forEach((img, index) => {
        setTimeout(() => {
            img.style.opacity = '0.8';
            img.style.transform = 'scale(1.02)';
            setTimeout(() => {
                img.style.opacity = '1';
                img.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
    
    // Newsletter form handler
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Simulate newsletter signup (replace with actual service)
            showNotification(`Thanks for subscribing! Welcome deals coming to ${email}`, 'success');
            this.reset();
            
            // Track newsletter signup
            console.log(`Newsletter signup: ${email}`);
        });
    }
    
    // Enhanced form validation for newsletter
    const newsletterInput = document.querySelector('.newsletter-form input');
    if (newsletterInput) {
        newsletterInput.addEventListener('input', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.style.borderColor = '#dc3545';
            } else {
                this.style.borderColor = '#28a745';
            }
        });
    }
    
    // Seasonal promotions rotation (could be automated)
    const promotionsSection = document.querySelector('.promotions h2');
    if (promotionsSection) {
        // You could add logic here to change seasonal promotions based on date
        const currentMonth = new Date().getMonth();
        let seasonalTitle = '🎃 Fall Water Recreation Specials';
        
        if (currentMonth >= 11 || currentMonth <= 1) {
            seasonalTitle = '❄️ Winter Gear & Prep Specials';
        } else if (currentMonth >= 2 && currentMonth <= 4) {
            seasonalTitle = '🌸 Spring Launch Specials';
        } else if (currentMonth >= 5 && currentMonth <= 8) {
            seasonalTitle = '☀️ Summer Water Sports Specials';
        }
        
        promotionsSection.textContent = seasonalTitle;
    }
    
    // Show affiliate disclosure
    console.log('Amazon Associate Program: This site contains affiliate links. We may earn commissions from qualifying purchases.');
});

// Product search functionality
function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    
    if (!searchTerm) {
        showNotification('Please enter a search term', 'error');
        return;
    }
    
    // Hide all product categories initially
    const categories = document.querySelectorAll('.shop-category');
    categories.forEach(category => {
        category.style.display = 'none';
    });
    
    // Search through product items
    let found = false;
    const productItems = document.querySelectorAll('.product-item');
    
    productItems.forEach(item => {
        const title = item.querySelector('h4').textContent.toLowerCase();
        const description = item.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            item.closest('.shop-category').style.display = 'block';
            item.style.backgroundColor = '#fff3cd';
            found = true;
        } else {
            item.style.backgroundColor = 'transparent';
        }
    });
    
    if (!found) {
        // If no products found, search Amazon directly
        const amazonAssociateId = 'castnfish-20';
        const amazonUrl = `https://amazon.com/s?k=${encodeURIComponent(searchTerm)}&tag=${amazonAssociateId}`;
        
        showNotification(`No local results found. Searching Amazon for "${searchTerm}"...`, 'info');
        setTimeout(() => {
            window.open(amazonUrl, '_blank');
        }, 1000);
    } else {
        showNotification(`Found products matching "${searchTerm}"`, 'success');
    }
}

// Clear search results
function clearSearch() {
    const categories = document.querySelectorAll('.shop-category');
    categories.forEach(category => {
        category.style.display = 'block';
    });
    
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        item.style.backgroundColor = 'transparent';
    });
    
    document.getElementById('productSearch').value = '';
}

// Enter key search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
        
        // Clear search when input is empty
        searchInput.addEventListener('input', function() {
            if (this.value === '') {
                clearSearch();
            }
        });
    }
});

// Download resource functionality
function downloadResource(resourceType) {
    // Simulate download (replace with actual file hosting)
    const resources = {
        'boat-safety-checklist': 'Boat Safety Checklist - Complete Guide to Safe Boating',
        'fishing-calendar': 'Seasonal Fishing Calendar - Year-Round Fishing Guide',
        'wakeboard-setup': 'Wakeboard Setup Guide - Complete Equipment Guide',
        'camping-essentials': 'Waterside Camping Essentials - Complete Packing List',
        'maintenance-schedule': 'Marine Maintenance Schedule - Year-Round Care Guide',
        'deals-tracker': 'Amazon Deals Tracker - Price Comparison Spreadsheet'
    };
    
    const resourceName = resources[resourceType] || 'Resource Guide';
    
    // Track download
    console.log(`Resource downloaded: ${resourceType}`);
    
    showNotification(`Downloading: ${resourceName}`, 'success');
    
    // In a real implementation, you would:
    // 1. Collect email for download gate
    // 2. Serve actual PDF/Excel files
    // 3. Add to mailing list
    
    // Simulate download with affiliate opportunity
    setTimeout(() => {
        const followUpMessage = `Thank you for downloading! Check out our recommended ${resourceType.includes('fishing') ? 'fishing' : resourceType.includes('boat') ? 'boating' : 'camping'} gear on Amazon.`;
        showNotification(followUpMessage, 'info');
    }, 2000);
}

// Enhanced email capture for downloads
function captureEmailForDownload(resourceType, email) {
    // This would integrate with your email service
    console.log(`Email captured for ${resourceType}: ${email}`);
    
    // Add to newsletter list
    // Trigger download
    // Send follow-up email with affiliate links
}

// Add some interactive effects
window.addEventListener('load', function() {
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
});

// Service card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});