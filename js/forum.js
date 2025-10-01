// Forum functionality

document.addEventListener('DOMContentLoaded', () => {
  // Initialize forum components
  initViewControls();
  initForumSearch();
  initCategoryFilters();
  initUserInteractions();
});

// View controls for categories
function initViewControls() {
  const viewButtons = document.querySelectorAll('.btn-view');
  const categoriesGrid = document.querySelector('.categories-grid');

  viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      viewButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      if (button.querySelector('.fa-th-large')) {
        categoriesGrid.classList.add('grid-view');
        categoriesGrid.classList.remove('list-view');
      } else {
        categoriesGrid.classList.add('list-view');
        categoriesGrid.classList.remove('grid-view');
      }
    });
  });
}

// Forum search functionality
function initForumSearch() {
  const searchForm = document.querySelector('.forum-search');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = e.target.querySelector('input').value;
      performSearch(query);
    });
  }
}

async function performSearch(query) {
  try {
    const response = await fetch(`/api/forum/search?q=${encodeURIComponent(query)}`);
    const results = await response.json();
    displaySearchResults(results);
  } catch (error) {
    console.error('Search failed:', error);
    showErrorMessage('Search failed. Please try again.');
  }
}

function displaySearchResults(results) {
  const resultsContainer = document.querySelector('.search-results');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = results.map(result => `
    <div class="search-result-item">
      <h3><a href="${result.url}">${result.title}</a></h3>
      <p>${result.excerpt}</p>
      <div class="result-meta">
        <span><i class="fas fa-user"></i> ${result.author}</span>
        <span><i class="fas fa-calendar"></i> ${result.date}</span>
        <span><i class="fas fa-comments"></i> ${result.replies} replies</span>
      </div>
    </div>
  `).join('');
}

// Category filters
function initCategoryFilters() {
  const filterInputs = document.querySelectorAll('.category-filter input');
  filterInputs.forEach(input => {
    input.addEventListener('change', () => {
      const activeFilters = getActiveFilters();
      filterCategories(activeFilters);
    });
  });
}

function getActiveFilters() {
  return Array.from(document.querySelectorAll('.category-filter input:checked'))
    .map(input => input.value);
}

function filterCategories(activeFilters) {
  const categories = document.querySelectorAll('.category-card');
  categories.forEach(category => {
    const categoryTags = category.dataset.tags.split(',');
    const visible = activeFilters.length === 0 || 
      activeFilters.some(filter => categoryTags.includes(filter));
    category.style.display = visible ? 'grid' : 'none';
  });
}

// User interactions
function initUserInteractions() {
  initLikeButtons();
  initReplyForms();
  initShareButtons();
}

function initLikeButtons() {
  const likeButtons = document.querySelectorAll('.btn-like');
  likeButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const postId = button.dataset.postId;
      try {
        const response = await fetch('/api/forum/like', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ postId })
        });
        
        if (response.ok) {
          const data = await response.json();
          updateLikeCount(button, data.likes);
          button.classList.toggle('liked');
        }
      } catch (error) {
        console.error('Like failed:', error);
        showErrorMessage('Unable to like post. Please try again.');
      }
    });
  });
}

function updateLikeCount(button, count) {
  const countSpan = button.querySelector('.like-count');
  if (countSpan) {
    countSpan.textContent = count;
  }
}

function initReplyForms() {
  const replyForms = document.querySelectorAll('.reply-form');
  replyForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const postId = form.dataset.postId;
      const content = form.querySelector('textarea').value;

      try {
        const response = await fetch('/api/forum/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ postId, content })
        });

        if (response.ok) {
          const reply = await response.json();
          addReplyToThread(postId, reply);
          form.reset();
        }
      } catch (error) {
        console.error('Reply failed:', error);
        showErrorMessage('Unable to post reply. Please try again.');
      }
    });
  });
}

function addReplyToThread(postId, reply) {
  const thread = document.querySelector(`#thread-${postId} .replies`);
  if (thread) {
    const replyElement = document.createElement('div');
    replyElement.className = 'reply';
    replyElement.innerHTML = `
      <div class="reply-header">
        <img src="${reply.author.avatar}" alt="Avatar" class="reply-avatar">
        <div class="reply-meta">
          <span class="reply-author">${reply.author.name}</span>
          <span class="reply-date">${reply.date}</span>
        </div>
      </div>
      <div class="reply-content">${reply.content}</div>
    `;
    thread.appendChild(replyElement);
  }
}

function initShareButtons() {
  const shareButtons = document.querySelectorAll('.btn-share');
  shareButtons.forEach(button => {
    button.addEventListener('click', () => {
      const postId = button.dataset.postId;
      const postUrl = `${window.location.origin}/community/posts/${postId}`;
      
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: postUrl
        }).catch(console.error);
      } else {
        // Fallback to clipboard copy
        navigator.clipboard.writeText(postUrl).then(() => {
          showMessage('Link copied to clipboard!');
        }).catch(error => {
          console.error('Share failed:', error);
          showErrorMessage('Unable to share. Please try again.');
        });
      }
    });
  });
}

// Utility functions
function showMessage(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showErrorMessage(message) {
  showMessage(message, 'error');
}

// Forum analytics
function trackUserActivity(action, data) {
  try {
    fetch('/api/forum/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        data,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
}