// Function to show welcome message for logged in users
function showWelcomeMessage(email, isPremium) {
    // Remove any existing welcome message
    const existingMessage = document.querySelector('.welcome-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create welcome message container
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    
    // Create message content
    const messageText = document.createElement('p');
    messageText.innerHTML = `Logged in as: <span class="user-email">${email}</span>`;
    
    // Create tier indicator
    const tierText = document.createElement('p');
    if (isPremium) {
        tierText.innerHTML = '⭐ Premium tier: Full access to all modules';
    } else {
        tierText.innerHTML = 'Free tier: Limited access to modules';
    }
    
    // Add logout button
    const logoutButton = document.createElement('button');
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', async () => {
        try {
            await window.supabase.auth.signOut();
            location.reload();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });
    
    // Append elements to welcome message
    welcomeMessage.appendChild(messageText);
    welcomeMessage.appendChild(tierText);
    welcomeMessage.appendChild(logoutButton);
    
    // Add to document
    document.body.appendChild(welcomeMessage);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        welcomeMessage.style.opacity = '0';
        welcomeMessage.style.transition = 'opacity 1s ease';
        setTimeout(() => welcomeMessage.remove(), 1000);
    }, 10000);
}

// Function to add upgrade button for non-premium users
function addUpgradeButton() {
    // Create upgrade button
    const upgradeButton = document.createElement('button');
    upgradeButton.id = 'upgradeToPremium';
    upgradeButton.innerHTML = '<i class="fas fa-crown"></i> Upgrade to Premium';
    
    // Add event listener to show premium modal
    upgradeButton.addEventListener('click', () => {
        document.getElementById('premiumModal').style.display = 'block';
    });
    
    // Add to controls section
    const controlsDiv = document.querySelector('.controls');
    if (controlsDiv) {
        controlsDiv.appendChild(upgradeButton);
    }
}
