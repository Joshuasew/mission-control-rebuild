/**
 * Daily News Module - Frontend Script
 * OpenClaw Mission Control
 */

// DOM Elements
const newsDateInput = document.getElementById('news-date');
const syncBtn = document.getElementById('sync-btn');
const globalNewsContainer = document.getElementById('global-news');
const techNewsContainer = document.getElementById('tech-news');
const aiNewsContainer = document.getElementById('ai-news');
const globalCount = document.getElementById('global-count');
const techCount = document.getElementById('tech-count');
const aiCount = document.getElementById('ai-count');
const velocityValue = document.getElementById('velocity-value');
const velocityFill = document.getElementById('velocity-fill');
const apiStatus = document.getElementById('api-status');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initDatePicker();
    loadNews();
    initSyncButton();
});

// Set date picker to today
function initDatePicker() {
    const today = new Date().toISOString().split('T')[0];
    newsDateInput.value = today;
    newsDateInput.max = today;
    
    newsDateInput.addEventListener('change', () => {
        loadNews(newsDateInput.value);
    });
}

// Initialize sync button
function initSyncButton() {
    syncBtn.addEventListener('click', () => {
        syncBtn.classList.add('syncing');
        syncBtn.querySelector('svg').style.animation = 'spin 1s linear infinite';
        
        // Force refresh news
        loadNews(newsDateInput.value, true).then(() => {
            setTimeout(() => {
                syncBtn.classList.remove('syncing');
            }, 1000);
        });
    });
}

// Load news for a specific date
async function loadNews(date = null, forceRefresh = false) {
    if (!date) {
        date = new Date().toISOString().split('T')[0];
    }
    
    showLoading();
    
    try {
        const url = forceRefresh 
            ? `/api/news?date=${date}&refresh=true`
            : `/api/news?date=${date}`;
            
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            renderNews(data);
            updateVelocity(85 + Math.random() * 15);
            apiStatus.textContent = 'Connected';
            apiStatus.classList.add('connected');
        } else {
            throw new Error('API error');
        }
    } catch (error) {
        console.error('Failed to load news:', error);
        apiStatus.textContent = 'Disconnected';
        apiStatus.classList.remove('connected');
        // Load sample data as fallback
        renderNews(getSampleNews());
    }
}

// Show loading state
function showLoading() {
    const loadingHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <span>Loading intelligence...</span>
        </div>
    `;
    globalNewsContainer.innerHTML = loadingHTML;
    techNewsContainer.innerHTML = loadingHTML;
    aiNewsContainer.innerHTML = loadingHTML;
}

// Render news to containers
function renderNews(data) {
    // Global Intelligence
    if (data.global && data.global.length > 0) {
        globalNewsContainer.innerHTML = data.global.map(item => createNewsCard(item)).join('');
        globalCount.textContent = `${data.global.length} REPORTS`;
    } else {
        globalNewsContainer.innerHTML = '<div class="loading-state"><span>No global news available</span></div>';
        globalCount.textContent = '0 REPORTS';
    }
    
    // Tech & World
    if (data.tech && data.tech.length > 0) {
        techNewsContainer.innerHTML = data.tech.map(item => createNewsCard(item)).join('');
        techCount.textContent = `${String(data.tech.length).padStart(2, '0')} LOCAL`;
    } else {
        techNewsContainer.innerHTML = '<div class="loading-state"><span>No tech news available</span></div>';
        techCount.textContent = '00 LOCAL';
    }
    
    // AI Media Feed
    if (data.ai && data.ai.length > 0) {
        aiNewsContainer.innerHTML = data.ai.map(item => createNewsCard(item, true)).join('');
        aiCount.textContent = `TRENDING: ${data.ai.length}`;
    } else {
        aiNewsContainer.innerHTML = '<div class="loading-state"><span>No AI news available</span></div>';
        aiCount.textContent = 'TRENDING: 0';
    }
}

// Create a news card HTML
function createNewsCard(item, isAI = false) {
    const categoryClass = getCategoryClass(item.category);
    const viralClass = getViralClass(item.viralScore);
    const timestamp = formatTimestamp(item.timestamp || item.date);
    
    let viewersHTML = '';
    if (item.viewers) {
        viewersHTML = `<span class="viewers-count">${item.viewers} WATCHING</span>`;
    }
    
    return `
        <div class="news-card">
            <div class="news-card-header">
                <span class="news-category ${categoryClass}">${item.category}</span>
                <span class="news-timestamp">${viewersHTML || timestamp}</span>
            </div>
            <h3 class="news-headline">${item.headline}</h3>
            <div class="news-card-footer">
                <div class="viral-score">
                    <span class="viral-label">VIRAL SCORE</span>
                    <span class="viral-value ${viralClass}">${item.viralScore}/10</span>
                </div>
                <a href="${item.url || '#'}" target="_blank" class="news-link" title="Open article">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                    </svg>
                </a>
            </div>
        </div>
    `;
}

// Get category CSS class
function getCategoryClass(category) {
    const map = {
        'BREAKING': 'breaking',
        'POLITICS': 'politics',
        'ECONOMY': 'economy',
        'TECH': 'tech',
        'LIVE STREAM': 'live',
        'SYNTHETIC MEDIA': 'synthetic',
        'AI': 'ai',
        'WORLD': 'world'
    };
    return map[category] || 'tech';
}

// Get viral score class
function getViralClass(score) {
    if (score >= 9) return 'high';
    if (score >= 7) return 'medium';
    return '';
}

// Format timestamp
function formatTimestamp(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${mins} UTC`;
}

// Update velocity meter
function updateVelocity(value) {
    velocityValue.textContent = `${Math.round(value)}%`;
    velocityFill.style.width = `${value}%`;
}

// Sample news data fallback
function getSampleNews() {
    return {
        global: [
            {
                category: 'BREAKING',
                headline: 'Quantum Supremacy: Global Banking Protocol Breach Detected',
                timestamp: new Date().toISOString(),
                viralScore: 9.8,
                url: '#'
            },
            {
                category: 'POLITICS',
                headline: 'Mars Colony Charter Signed by 140 Nations',
                timestamp: new Date().toISOString(),
                viralScore: 7.2,
                url: '#'
            },
            {
                category: 'WORLD',
                headline: 'Arctic Digital Infrastructure Hub Announced',
                timestamp: new Date().toISOString(),
                viralScore: 6.5,
                url: '#'
            }
        ],
        tech: [
            {
                category: 'ECONOMY',
                headline: 'Kuala Lumpur Becomes Southeast Asia\'s Premier AI Hub',
                timestamp: new Date().toISOString(),
                viralScore: 8.5,
                url: '#'
            },
            {
                category: 'TECH',
                headline: 'Penang Semiconductor Corridor Announces Next-Gen Neural Chips',
                timestamp: new Date().toISOString(),
                viralScore: 6.9,
                url: '#'
            },
            {
                category: 'TECH',
                headline: 'OpenAI Releases GPT-5 with Multimodal Reasoning',
                timestamp: new Date().toISOString(),
                viralScore: 9.2,
                url: '#'
            }
        ],
        ai: [
            {
                category: 'LIVE STREAM',
                headline: 'NVIDIA CEO Unveils \'Project Blackwell\' - The Last Human-Designed Architecture?',
                timestamp: new Date().toISOString(),
                viralScore: 9.9,
                viewers: '22.4K',
                url: '#'
            },
            {
                category: 'SYNTHETIC MEDIA',
                headline: 'The Rise of AI YouTubers: Why Real Humans are Losing the Algorithm War',
                timestamp: new Date().toISOString(),
                viralScore: 8.1,
                url: '#'
            },
            {
                category: 'AI',
                headline: 'Claude 4 Passes Medical Board Exam with 99.7% Accuracy',
                timestamp: new Date().toISOString(),
                viralScore: 9.4,
                url: '#'
            }
        ]
    };
}

// Periodic velocity animation
setInterval(() => {
    const currentVelocity = parseFloat(velocityValue.textContent);
    const newVelocity = Math.max(70, Math.min(99, currentVelocity + (Math.random() - 0.5) * 5));
    updateVelocity(newVelocity);
}, 3000);
