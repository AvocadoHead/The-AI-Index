// Enhanced user functions with security improvements

// Input sanitization function to prevent XSS attacks
function sanitizeInput(input) {
    if (!input) return '';
    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Validate URL function to prevent malicious URLs
function validateUrl(url) {
    if (!url) return false;
    
    try {
        const parsedUrl = new URL(url);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (e) {
        return false;
    }
}

// Rate limiting for authentication attempts
const authAttempts = {};
const MAX_AUTH_ATTEMPTS = 5;
const AUTH_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

function checkAuthRateLimit(email) {
    const now = Date.now();
    
    // Clean up expired entries
    Object.keys(authAttempts).forEach(key => {
        if (authAttempts[key].timeout < now) {
            delete authAttempts[key];
        }
    });
    
    // Check if email is rate limited
    if (authAttempts[email] && authAttempts[email].count >= MAX_AUTH_ATTEMPTS) {
        return false;
    }
    
    // Initialize or increment counter
    if (!authAttempts[email]) {
        authAttempts[email] = {
            count: 1,
            timeout: now + AUTH_TIMEOUT_MS
        };
    } else {
        authAttempts[email].count++;
    }
    
    return true;
}

// Secure sign in with rate limiting
async function secureSignIn() {
    const email = sanitizeInput(document.getElementById('authEmail').value);
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    // Check rate limiting
    if (!checkAuthRateLimit(email)) {
        alert('Too many login attempts. Please try again later.');
        return;
    }
    
    try {
        const { data, error } = await window.supabase.auth.signInWithPassword({ 
            email: email, 
            password: password 
        });
        
        if (error) {
            alert('Error logging in: ' + error.message);
            console.error('Error logging in:', error.message);
        } else {
            console.log('Sign in successful');
            // Reset rate limiting on successful login
            if (authAttempts[email]) {
                delete authAttempts[email];
            }
            
            document.getElementById('authModal').style.display = 'none';
            checkUserTierAndLoadModules();
        }
    } catch (err) {
        console.error('Exception during sign in:', err);
        alert('An error occurred during sign in. Please try again.');
    }
}

// Secure sign up with input validation
async function secureSignUp() {
    const email = sanitizeInput(document.getElementById('authEmail').value);
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Validate password strength
    if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }
    
    try {
        const { data, error } = await window.supabase.auth.signUp({ 
            email: email, 
            password: password 
        });
        
        if (error) {
            alert('Error signing up: ' + error.message);
            console.error('Error signing up:', error.message);
        } else {
            alert('Sign up successful! Please check your email to confirm your account.');
            console.log('Sign up successful');
        }
    } catch (err) {
        console.error('Exception during sign up:', err);
        alert('An error occurred during sign up. Please try again.');
    }
}

// Secure module addition with input validation
function secureAddModule() {
    const name = sanitizeInput(document.getElementById('moduleName').value);
    const url = document.getElementById('moduleUrl').value;
    const categoriesInput = sanitizeInput(document.getElementById('moduleCategories').value);
    
    if (!name || !url || !categoriesInput) {
        alert('Please fill in all fields');
        return;
    }
    
    // Validate URL
    if (!validateUrl(url)) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
    }
    
    // Parse categories and scores with validation
    const categoryPairs = categoriesInput.split(',').map(pair => pair.trim());
    const categories = categoryPairs.map(pair => {
        const parts = pair.split(':');
        return sanitizeInput(parts[0]);
    }).join(', ');
    
    const scores = {};
    let validScores = true;
    
    categoryPairs.forEach(pair => {
        const [category, score] = pair.split(':');
        const parsedScore = parseInt(score?.trim(), 10);
        
        if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
            validScores = false;
            return;
        }
        
        scores[sanitizeInput(category.trim())] = parsedScore;
    });
    
    if (!validScores) {
        alert('Scores must be numbers between 0 and 100');
        return;
    }
    
    // Create new module
    if (window.moduleCloud) {
        const newModule = new AIModule(name, categories, url, scores, false);
        window.moduleCloud.modules.push(newModule);
        
        // Reset form
        document.getElementById('moduleName').value = '';
        document.getElementById('moduleUrl').value = '';
        document.getElementById('moduleCategories').value = '';
        
        // Reposition modules
        window.moduleCloud.positionModules();
        
        alert(`Module "${name}" added successfully`);
    } else {
        alert('Error: Module cloud not initialized');
    }
}

// Override the default functions with secure versions
document.addEventListener('DOMContentLoaded', function() {
    // Replace sign in function
    const signInButton = document.getElementById('signInButton');
    if (signInButton) {
        signInButton.removeEventListener('click', signIn);
        signInButton.addEventListener('click', secureSignIn);
    }
    
    // Replace sign up function
    const signUpButton = document.getElementById('signUpButton');
    if (signUpButton) {
        signUpButton.removeEventListener('click', signUp);
        signUpButton.addEventListener('click', secureSignUp);
    }
    
    // Replace module form submission
    const moduleForm = document.getElementById('moduleForm');
    if (moduleForm) {
        moduleForm.removeEventListener('submit', function(e) {
            e.preventDefault();
            window.moduleCloud.addNewModule();
        });
        
        moduleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            secureAddModule();
        });
    }
    
    // Add CSRF protection token to forms
    const csrfToken = generateCSRFToken();
    document.querySelectorAll('form').forEach(form => {
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'csrf_token';
        tokenInput.value = csrfToken;
        form.appendChild(tokenInput);
    });
});

// Generate CSRF token
function generateCSRFToken() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store CSRF token in session storage
function storeCSRFToken(token) {
    sessionStorage.setItem('csrf_token', token);
}

// Validate CSRF token
function validateCSRFToken(token) {
    return token === sessionStorage.getItem('csrf_token');
}

// Initialize CSRF protection
document.addEventListener('DOMContentLoaded', function() {
    const token = generateCSRFToken();
    storeCSRFToken(token);
});
