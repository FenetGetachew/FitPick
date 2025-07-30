// Backend API configuration
const API_BASE_URL = 'http://localhost:5000';

// Auth state
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Get DOM elements
const form = document.getElementById('outfitForm');
const seasonSelect = document.getElementById('season');
const eventSelect = document.getElementById('event');
const generateBtn = document.querySelector('.generate-btn');
const placeholder = document.getElementById('placeholder');
const loading = document.getElementById('loading');
const outfitResult = document.getElementById('outfitResult');
const outfitContent = document.getElementById('outfitContent');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// Initialize the application
async function initializeApp() {
    if (authToken) {
        try {
            await validateToken();
        } catch (error) {
            logout();
        }
    }
    updateUI();
}

// Setup all event listeners
function setupEventListeners() {
    // Outfit generation form
    form.addEventListener('submit', handleOutfitGeneration);
}

// Add authentication buttons to the page - FIXED VERSION
function addAuthButtons() {
    // Remove ALL existing auth sections first
    const existingAuthSections = document.querySelectorAll('.auth-section');
    existingAuthSections.forEach(section => section.remove());
    
    const header = document.querySelector('header') || document.querySelector('.container');
    
    const authDiv = document.createElement('div');
    authDiv.className = 'auth-section';
    
    if (!currentUser) {
        authDiv.innerHTML = `
            <div style="text-align: center; margin: 20px 0;">
                <button id="loginBtn" class="auth-btn">Login</button>
                <button id="signupBtn" class="auth-btn">Sign Up</button>
            </div>
        `;
        header.insertBefore(authDiv, header.firstChild);
        
        // Add event listeners
        document.getElementById('loginBtn').addEventListener('click', showLoginForm);
        document.getElementById('signupBtn').addEventListener('click', showSignupForm);
    } else {
        authDiv.innerHTML = `
            <div style="text-align: center; margin: 20px 0; color: #4a90e2;">
                Welcome, ${currentUser.username}!
                <button id="logoutBtn" class="auth-btn" style="margin-left: 10px;">Logout</button>
            </div>
        `;
        header.insertBefore(authDiv, header.firstChild);
        
        // Add event listener
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
}

// Show login form
function showLoginForm() {
    const username = prompt('Username or Email:');
    const password = prompt('Password:');
    
    if (username && password) {
        login(username, password);
    }
}

// Show signup form  
function showSignupForm() {
    const username = prompt('Choose a username:');
    const email = prompt('Enter your email:');
    const password = prompt('Choose a password (min 6 characters):');
    
    if (username && email && password) {
        signup(username, email, password);
    }
}

// Handle outfit generation
async function handleOutfitGeneration(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login first to generate outfits!');
        showLoginForm();
        return;
    }
    
    const season = seasonSelect.value;
    const event = eventSelect.value;
    
    if (!season || !event) {
        alert('Please select both season and event!');
        return;
    }
    
    await generateOutfit(season, event);
}

// Generate outfit through backend API
async function generateOutfit(season, event) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/api/outfits/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ season, event })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to generate outfit');
        }
        
        displayOutfit(data.outfit, season, event);
        
    } catch (error) {
        console.error('Error generating outfit:', error);
        showError(error.message);
    }
}

// Authentication functions
/*
async function signup(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            alert('Account created successfully!');
            updateUI();
        } else {
            alert(data.message || 'Signup failed');
        }
    } catch (error) {
        alert('Signup error: ' + error.message);
    }
}
    */

async function signup(username, email, password) {
    alert('Testing new signup function!'); // This will confirm it's running
    try {
        console.log('Attempting signup for:', username, email);
        
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            alert('Account created successfully!');
            updateUI();
        } else {
            alert(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Registration error: ' + error.message);
    }
}

/*
async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            alert('Login successful!');
            updateUI();
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        alert('Login error: ' + error.message);
    }
}
    */

async function login(username, password) {
    try {
        console.log('Attempting login for:', username); // Debug log
        
        const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        console.log('Response status:', response.status); // Debug log
        console.log('Response headers:', response.headers); // Debug log
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error('Server returned non-JSON response');
            console.error('Response text:', await response.text());
            alert('Server error: Invalid response format');
            return;
        }
        
        const data = await response.json();
        console.log('Response data:', data); // Debug log
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            alert('Login successful!');
            updateUI();
        } else {
            // Show the actual error message from server
            console.error('Login failed:', JSON.stringify(data, null, 2));
            alert(`Login failed: ${data.message || data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Login error details:', error);
        
        // Check if it's a network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            alert('Cannot connect to server. Make sure your backend is running on http://localhost:5000');
        } else {
            alert('Login error: ' + error.message);
        }
    }
}


async function validateToken() {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });
    
    if (response.ok) {
        const data = await response.json();
        currentUser = data.user;
    } else {
        throw new Error('Invalid token');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateUI();
}

// Update UI based on auth state - SIMPLIFIED VERSION
function updateUI() {
    // Update auth buttons
    addAuthButtons();
    
    // Update generate button state
    if (!currentUser) {
        generateBtn.textContent = 'Login to Generate Outfit';
    } else {
        generateBtn.textContent = 'Generate My Outfit';
    }
}

// Display the generated outfit (same as before but updated)
function displayOutfit(apiResponse, season, event) {
    try {
        // Try to parse JSON response
        const outfit = JSON.parse(apiResponse);
        
        outfitContent.innerHTML = `
            <div class="outfit-item fade-in">
                <div class="outfit-category">Top:</div>
                <div class="outfit-suggestion">${outfit.top}</div>
            </div>
            <div class="outfit-item fade-in">
                <div class="outfit-category">Bottom:</div>
                <div class="outfit-suggestion">${outfit.bottom}</div>
            </div>
            <div class="outfit-item fade-in">
                <div class="outfit-category">Shoes:</div>
                <div class="outfit-suggestion">${outfit.shoes}</div>
            </div>
            <div class="outfit-item fade-in">
                <div class="outfit-category">Accessories:</div>
                <div class="outfit-suggestion">${outfit.accessories}</div>
            </div>
            <div class="style-note fade-in">
                <div class="style-note-title">Style Tip:</div>
                <div class="style-note-text">${outfit.style_tip}</div>
            </div>
        `;
        
        hideLoading();
        
    } catch (error) {
        // If JSON parsing fails, show raw response
        outfitContent.innerHTML = `
            <div class="outfit-item fade-in">
                <div class="outfit-category">Outfit Suggestion:</div>
                <div class="outfit-suggestion">${apiResponse}</div>
            </div>
        `;
        hideLoading();
    }
}

// Show loading state
function showLoading() {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    placeholder.style.display = 'none';
    loading.style.display = 'block';
    outfitContent.innerHTML = '';
}

// Hide loading state
function hideLoading() {
    generateBtn.disabled = false;
    updateUI(); // This will set the correct button text
    loading.style.display = 'none';
}

// Show error message
function showError(message = 'Sorry, there was an error generating your outfit.') {
    hideLoading();
    outfitContent.innerHTML = `
        <div class="outfit-item">
            <div class="outfit-category">Error:</div>
            <div class="outfit-suggestion">${message}</div>
        </div>
    `;
}