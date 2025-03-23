// Authentication and premium features for AI Module Cloud
// This file handles user authentication, premium tier, and payment options

// DOM Elements
const loginButton = document.getElementById('loginButton');
const authModal = document.getElementById('authModal');
const premiumModal = document.getElementById('premiumModal');
const signInButton = document.getElementById('signInButton');
const signUpButton = document.getElementById('signUpButton');
const requestPremiumButton = document.getElementById('requestPremium');
const copyBitNumberButton = document.getElementById('copyBitNumber');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Initialize authentication handlers
function initializeAuth() {
    // Login button click handler
    loginButton.addEventListener('click', function() {
        if (window.appState && window.appState.isAuthenticated) {
            // Show premium modal for authenticated users
            if (!window.appState.isPremium) {
                premiumModal.style.display = 'block';
            } else {
                // Show logout option for premium users
                if (confirm('You are logged in as a premium user. Would you like to log out?')) {
                    window.databaseModule.signOut().then(result => {
                        if (result.success) {
                            alert('You have been logged out successfully');
                        } else {
                            alert('Error logging out: ' + result.message);
                        }
                    });
                }
            }
        } else {
            // Show auth modal for non-authenticated users
            authModal.style.display = 'block';
        }
    });

    // Sign in button click handler
    signInButton.addEventListener('click', function() {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        window.databaseModule.signIn(email, password).then(result => {
            if (result.success) {
                authModal.style.display = 'none';
                alert('You have been signed in successfully');
            } else {
                alert('Error signing in: ' + result.message);
            }
        });
    });

    // Sign up button click handler
    signUpButton.addEventListener('click', function() {
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        window.databaseModule.signUp(email, password).then(result => {
            if (result.success) {
                alert(result.message);
                // Clear form
                document.getElementById('authEmail').value = '';
                document.getElementById('authPassword').value = '';
            } else {
                alert('Error signing up: ' + result.message);
            }
        });
    });

    // Request premium button click handler
    requestPremiumButton.addEventListener('click', function() {
        window.location.href = 'mailto:Eyalizenman@gmail.com?subject=Premium%20Access%20Request&body=I%20would%20like%20to%20upgrade%20to%20premium%20access%20for%20$5%20lifetime%20fee.';
    });

    // Copy Bit number button click handler
    copyBitNumberButton.addEventListener('click', function() {
        const bitNumber = '+972 547731650';
        
        navigator.clipboard.writeText(bitNumber)
            .then(() => {
                alert('Bit phone number copied to clipboard: ' + bitNumber);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                alert('Please manually copy this number: ' + bitNumber);
            });
    });

    // Close modal buttons
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === authModal) {
            authModal.style.display = 'none';
        }
        if (event.target === premiumModal) {
            premiumModal.style.display = 'none';
        }
    });
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication handlers
    initializeAuth();
});
