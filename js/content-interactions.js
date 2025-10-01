// Product Carousel
document.addEventListener('DOMContentLoaded', function() {
    initializeProductSlider();
    initializeCommunityFeatures();
    handleNewsInteractions();
});

function initializeProductSlider() {
    const slider = document.querySelector('.product-slider');
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walk;
    });

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            const card = e.target.closest('.product-card');
            const productName = card.querySelector('h3').textContent;
            const price = card.querySelector('.current-price').textContent;
            
            addToCart({
                name: productName,
                price: price,
                quantity: 1
            });
        });
    });
}

function addToCart(product) {
    // Get existing cart or initialize new one
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists
    const existingProduct = cart.find(p => p.name === product.name);
    
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.push(product);
    }
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`Added ${product.name} to cart`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((total, product) => total + product.quantity, 0);
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
        cartCount.textContent = count;
        if (count > 0) {
            cartCount.classList.add('active');
        }
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function initializeCommunityFeatures() {
    // Lazy load community images
    const communityImages = document.querySelectorAll('.catch-card img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    communityImages.forEach(img => {
        imageObserver.observe(img);
    });

    // Initialize like functionality
    document.querySelectorAll('.catch-card').forEach(card => {
        const likeBtn = card.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', function() {
                const catchId = this.dataset.catchId;
                toggleLike(catchId, this);
            });
        }
    });
}

async function toggleLike(catchId, button) {
    try {
        const response = await fetch(`/api/catches/${catchId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            button.classList.toggle('liked');
            const count = button.querySelector('.like-count');
            if (count) {
                count.textContent = data.likes;
            }
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

function handleNewsInteractions() {
    // Track article views
    const articles = document.querySelectorAll('.featured-article, .news-card');
    const articleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const article = entry.target;
                const articleId = article.dataset.articleId;
                if (articleId) {
                    trackArticleView(articleId);
                }
            }
        });
    }, {
        threshold: 0.5
    });
    
    articles.forEach(article => {
        articleObserver.observe(article);
    });
}

async function trackArticleView(articleId) {
    try {
        await fetch('/api/articles/track-view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                articleId: articleId
            })
        });
    } catch (error) {
        console.error('Error tracking article view:', error);
    }
}