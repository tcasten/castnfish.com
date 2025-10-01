// Topic Editor functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
});

function initializeEditor() {
    setupEditorToolbar();
    setupTagsInput();
    setupPreview();
    setupFormSubmission();
    setupSimilarTopicsSearch();
}

// Editor Toolbar Setup
function setupEditorToolbar() {
    const toolbar = document.querySelector('.editor-toolbar');
    const editor = document.getElementById('topicContent');

    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        e.preventDefault();
        const format = button.dataset.format;
        applyFormat(editor, format);
    });

    // Keyboard shortcuts
    editor.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyFormat(editor, 'bold');
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormat(editor, 'italic');
                    break;
            }
        }
    });
}

function applyFormat(editor, format) {
    const formats = {
        bold: { prefix: '**', suffix: '**' },
        italic: { prefix: '*', suffix: '*' },
        link: { prefix: '[', suffix: '](url)' },
        image: { prefix: '![alt text](', suffix: ')' },
        'list-ul': { prefix: '- ', multiline: true },
        'list-ol': { prefix: '1. ', multiline: true },
        quote: { prefix: '> ', multiline: true },
        code: { prefix: '```\n', suffix: '\n```' }
    };

    const selection = {
        start: editor.selectionStart,
        end: editor.selectionEnd,
        text: editor.value.substring(editor.selectionStart, editor.selectionEnd)
    };

    let formattedText = selection.text;
    const format_def = formats[format];

    if (format === 'link' && !selection.text) {
        insertFormat(editor, '[Link text](url)');
        return;
    }

    if (format === 'image' && !selection.text) {
        insertFormat(editor, '![Image description](image-url)');
        return;
    }

    if (format_def.multiline) {
        formattedText = selection.text
            .split('\n')
            .map(line => format_def.prefix + line)
            .join('\n');
    } else {
        formattedText = format_def.prefix + selection.text + (format_def.suffix || '');
    }

    insertFormat(editor, formattedText, selection);
}

function insertFormat(editor, text, selection = null) {
    const start = selection ? selection.start : editor.selectionStart;
    const end = selection ? selection.end : editor.selectionStart;

    editor.focus();
    document.execCommand('insertText', false, text);

    if (selection) {
        editor.selectionStart = start;
        editor.selectionEnd = start + text.length;
    }
}

// Tags Input Setup
function setupTagsInput() {
    const tagsInput = document.getElementById('topicTags');
    const tagsContainer = document.querySelector('.tags-container');
    const tags = new Set();
    const MAX_TAGS = 5;

    tagsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = tagsInput.value.trim().toLowerCase();
            
            if (tag && tags.size < MAX_TAGS) {
                if (!tags.has(tag)) {
                    tags.add(tag);
                    addTagElement(tag);
                }
                tagsInput.value = '';
            }
        }
    });

    function addTagElement(tag) {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${tag}
            <button type="button" aria-label="Remove tag">
                <i class="fas fa-times"></i>
            </button>
        `;

        tagElement.querySelector('button').addEventListener('click', () => {
            tags.delete(tag);
            tagElement.remove();
        });

        tagsContainer.appendChild(tagElement);
    }
}

// Preview Setup
function setupPreview() {
    const previewBtn = document.querySelector('.btn-preview');
    const closePreviewBtn = document.querySelector('.btn-close-preview');
    const previewPanel = document.querySelector('.topic-preview');
    const previewContent = document.querySelector('.preview-content');
    const editor = document.getElementById('topicContent');

    previewBtn.addEventListener('click', () => {
        const content = editor.value;
        previewContent.innerHTML = marked.parse(content);
        previewPanel.style.display = 'block';
    });

    closePreviewBtn.addEventListener('click', () => {
        previewPanel.style.display = 'none';
    });

    // Live preview update
    let previewTimeout;
    editor.addEventListener('input', () => {
        if (previewPanel.style.display === 'block') {
            clearTimeout(previewTimeout);
            previewTimeout = setTimeout(() => {
                previewContent.innerHTML = marked.parse(editor.value);
            }, 300);
        }
    });
}

// Form Submission
function setupFormSubmission() {
    const form = document.getElementById('newTopicForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            return;
        }

        // Collect form data
        const formData = {
            title: document.getElementById('topicTitle').value,
            category: document.getElementById('topicCategory').value,
            content: document.getElementById('topicContent').value,
            tags: Array.from(document.querySelectorAll('.tag-item'))
                .map(tag => tag.textContent.trim()),
            notifications: form.querySelector('[name="notifications"]').checked
        };

        try {
            // Submit the topic
            const response = await fetch('/api/forum/topics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                window.location.href = `/community/forum/topic/${result.id}`;
            } else {
                throw new Error('Failed to create topic');
            }
        } catch (error) {
            console.error('Error creating topic:', error);
            showNotification('Error creating topic. Please try again.', 'error');
        }
    });
}

function validateForm() {
    const title = document.getElementById('topicTitle').value.trim();
    const category = document.getElementById('topicCategory').value;
    const content = document.getElementById('topicContent').value.trim();

    if (title.length < 10) {
        showNotification('Title must be at least 10 characters long', 'error');
        return false;
    }

    if (!category) {
        showNotification('Please select a category', 'error');
        return false;
    }

    if (content.length < 30) {
        showNotification('Content must be at least 30 characters long', 'error');
        return false;
    }

    return true;
}

// Similar Topics Search
function setupSimilarTopicsSearch() {
    const titleInput = document.getElementById('topicTitle');
    let searchTimeout;

    titleInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchSimilarTopics(titleInput.value);
        }, 500);
    });
}

async function searchSimilarTopics(query) {
    if (query.length < 3) return;

    try {
        const response = await fetch(`/api/forum/topics/similar?q=${encodeURIComponent(query)}`);
        const topics = await response.json();
        updateSimilarTopicsList(topics);
    } catch (error) {
        console.error('Error searching similar topics:', error);
    }
}

function updateSimilarTopicsList(topics) {
    const container = document.querySelector('.similar-topics-list');
    container.innerHTML = '';

    if (topics.length === 0) {
        container.innerHTML = '<p>No similar topics found</p>';
        return;
    }

    topics.forEach(topic => {
        const topicElement = document.createElement('div');
        topicElement.className = 'similar-topic-item';
        topicElement.innerHTML = `
            <a href="/community/forum/topic/${topic.id}">${topic.title}</a>
        `;
        container.appendChild(topicElement);
    });
}

// Utility Functions
function showNotification(message, type = 'error') {
    // Implementation depends on your notification system
    console.log(`${type}: ${message}`);
}