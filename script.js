// No import needed as we're using the global supabase object

class AIModule {
    constructor(name, categories, url, scores = {}, isPremium = false) {
        this.name = name;
        this.categories = categories;
        this.url = url;
        this.scores = scores;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.targetZ = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.visible = true;
        this.scale = 1;
        this.opacity = 1;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.isPremium = isPremium;
    }

    update() {
        const easing = 0.1;
        this.x += (this.targetX - this.x) * easing;
        this.y += (this.targetY - this.y) * easing;
        this.z += (this.targetZ - this.z) * easing;
    }

    getAverageScore(selectedCategories) {
        // For 'all' category, calculate average of all scores
        if (selectedCategories.has('all')) {
            const scores = Object.values(this.scores);
            return scores.length > 0 ? 
                scores.reduce((sum, score) => sum + score, 0) / scores.length 
                : 1;
        }
        
        // Original logic for specific categories
        let totalScore = 0;
        let count = 0;
        selectedCategories.forEach(category => {
            if (this.scores[category]) {
                totalScore += this.scores[category];
                count++;
            }
        });
        return count > 0 ? totalScore / count : 0;
    }
}

class ModuleCloud {
    constructor() {
        this.canvas = document.querySelector('#moduleCloud');
        this.ctx = this.canvas.getContext('2d');
        this.modules = [];
        this.selectedCategories = new Set(['all']);
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.cameraRotationX = 0;
        this.cameraRotationY = 0;
        this.zoomLevel = 1;
        this.isDarkMode = false;
        this.bgColor = '#ffffff';
        this.tooltipElement = document.getElementById('tooltip');
        this.hoveredModule = null;
        this.selectedModule = null;
        this.fontSizeMultiplier = 1;
        this.isEditMode = false;
        this.isDeleteMode = false;
        this.userTier = 'free'; // Default to free tier

        this.setupEventListeners();
        this.resizeCanvas();
        this.loadModules();
        this.animate();
    }

    async loadModules() {
        try {
            // Check if user is premium
            const isPremium = await this.checkUserPremiumStatus();
            this.userTier = isPremium ? 'premium' : 'free';
            
            // Load modules based on user tier
            if (isPremium) {
                // Use both default and premium modules for premium users
                if (window.defaultModules && Array.isArray(window.defaultModules) && 
                    window.premiumModules && Array.isArray(window.premiumModules)) {
                    
                    // Load all modules for premium users
                    const allModules = [...window.defaultModules, ...window.premiumModules];
                    this.modules = allModules.map(module => 
                        new AIModule(
                            module.name, 
                            module.categories, 
                            module.url, 
                            module.scores,
                            module.is_premium || false
                        )
                    );
                    console.log(`Loaded ${this.modules.length} modules for premium user`);
                } else {
                    console.error('Premium modules not found, falling back to default modules');
                    this.loadDefaultModules();
                }
            } else {
                // Load free tier modules (limited subset)
                this.loadDefaultModules();
            }
            
            // Position modules in 3D space
            this.positionModules();
        } catch (error) {
            console.error('Error loading modules:', error);
            // Fallback to default modules
            this.loadDefaultModules();
        }
    }

    loadDefaultModules() {
        // Use default modules directly from the global variable
        if (window.defaultModules && Array.isArray(window.defaultModules)) {
            // For free tier, limit to approximately 100 modules
            const moduleLimit = 100;
            const modulesToUse = window.defaultModules.slice(0, moduleLimit);
            
            this.modules = modulesToUse.map(module => 
                new AIModule(
                    module.name, 
                    module.categories, 
                    module.url, 
                    module.scores,
                    false
                )
            );
            console.log(`Loaded ${this.modules.length} free tier modules`);
            
            // Position modules in 3D space
            this.positionModules();
        } else {
            console.error('Default modules not found');
        }
    }

    async checkUserPremiumStatus() {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                console.log('No authenticated user found');
                return false;
            }
            
            // Check if user is premium directly from auth metadata
            // This avoids the need for a separate users table
            const isPremium = user.user_metadata?.is_premium === true;
            console.log(`User premium status from metadata: ${isPremium}`);
            
            return isPremium || false;
        } catch (error) {
            console.error('Error checking premium status:', error);
            return false;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                this.cameraRotationY += deltaX * 0.01;
                this.cameraRotationX += deltaY * 0.01;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }

            // Handle module hover
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.handleModuleHover(mouseX, mouseY);
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            this.handleModuleClick(mouseX, mouseY);
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoomLevel += e.deltaY * -0.001;
            this.zoomLevel = Math.min(Math.max(0.5, this.zoomLevel), 2);
        });

        // Category filter buttons
        document.querySelectorAll('.sidebar button').forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                console.log('Category selected:', category);
                
                // Toggle active class
                document.querySelectorAll('.sidebar button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // Update selected categories
                this.selectedCategories.clear();
                this.selectedCategories.add(category);
                
                // Reposition modules based on new filter
                this.positionModules();
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebarContainer = document.querySelector('.sidebar-container');
                if (sidebarContainer) {
                    sidebarContainer.classList.toggle('collapsed');
                    console.log('Sidebar toggled');
                } else {
                    console.error('Sidebar container not found');
                }
            });
        } else {
            console.error('Sidebar toggle button not found');
        }

        // Font size controls
        document.getElementById('increaseFontSize').addEventListener('click', () => {
            this.fontSizeMultiplier += 0.1;
        });

        document.getElementById('decreaseFontSize').addEventListener('click', () => {
            this.fontSizeMultiplier = Math.max(0.5, this.fontSizeMultiplier - 0.1);
        });

        // Module management
        document.getElementById('addModule').addEventListener('click', () => {
            document.querySelector('#addModule + .dropdown-content').classList.toggle('show');
        });

        document.getElementById('moduleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewModule();
        });

        document.getElementById('deleteModule').addEventListener('click', () => {
            this.isDeleteMode = !this.isDeleteMode;
            this.isEditMode = false;
            document.getElementById('deleteModule').classList.toggle('active');
            document.getElementById('editModule').classList.remove('active');
        });

        const editModuleBtn = document.getElementById('editModule');
        if (editModuleBtn) {
            editModuleBtn.addEventListener('click', () => {
                this.isEditMode = !this.isEditMode;
                this.isDeleteMode = false;
                editModuleBtn.classList.toggle('active');
                const deleteModuleBtn = document.getElementById('deleteModule');
                if (deleteModuleBtn) {
                    deleteModuleBtn.classList.remove('active');
                }
                console.log('Edit mode toggled:', this.isEditMode);
            });
        } else {
            console.error('Edit module button not found');
        }

        const editModuleFormEl = document.getElementById('editModuleForm');
        if (editModuleFormEl) {
            editModuleFormEl.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateModule();
                console.log('Edit module form submitted');
            });
        } else {
            console.error('Edit module form not found');
        }

        // Background color picker
        document.getElementById('bgColor').addEventListener('input', (e) => {
            this.bgColor = e.target.value;
            document.body.style.backgroundColor = this.bgColor;
        });

        // Dark mode toggle
        document.getElementById('toggleMode').addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Save and load index
        document.getElementById('saveIndex').addEventListener('click', () => {
            this.saveModulesToFile();
        });

        const loadIndexBtn = document.getElementById('loadIndex');
        if (loadIndexBtn) {
            loadIndexBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.click();
                    console.log('File input clicked');
                } else {
                    console.error('File input element not found');
                }
            });
        } else {
            console.error('Load index button not found');
        }

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.loadModulesFromFile(e.target.files[0]);
        });

        // Premium upgrade button
        document.getElementById('requestPremium').addEventListener('click', () => {
            window.location.href = 'mailto:Eyalizenman@gmail.com?subject=Premium%20Access%20Request&body=I%20would%20like%20to%20request%20premium%20access%20to%20the%20AI%20Module%20Cloud.';
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    positionModules() {
        // Filter modules based on selected categories
        const visibleModules = this.modules.filter(module => {
            if (this.selectedCategories.has('all')) {
                return true;
            }
            return module.categories.some(category => this.selectedCategories.has(category));
        });

        // Position modules in 3D space
        const radius = 500;
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        visibleModules.forEach((module, i) => {
            const y = 1 - (i / (visibleModules.length - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phi * i;

            module.targetX = radius * radiusAtY * Math.cos(theta);
            module.targetY = radius * y;
            module.targetZ = radius * radiusAtY * Math.sin(theta);

            // Set initial position if not already set
            if (module.x === 0 && module.y === 0 && module.z === 0) {
                module.x = module.targetX;
                module.y = module.targetY;
                module.z = module.targetZ;
            }

            // Set visibility
            module.visible = true;
        });

        // Hide modules that don't match the filter
        this.modules.forEach(module => {
            if (!visibleModules.includes(module)) {
                module.visible = false;
            }
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
        this.render();
    }

    update() {
        this.modules.forEach(module => module.update());
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set background color
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Sort modules by z-index for proper rendering
        const sortedModules = [...this.modules]
            .filter(module => module.visible)
            .sort((a, b) => b.z - a.z);

        // Render modules
        sortedModules.forEach(module => {
            // Apply camera transformations
            const x = module.x * Math.cos(this.cameraRotationY) - module.z * Math.sin(this.cameraRotationY);
            const z = module.x * Math.sin(this.cameraRotationY) + module.z * Math.cos(this.cameraRotationY);
            const y = module.y * Math.cos(this.cameraRotationX) - z * Math.sin(this.cameraRotationX);
            const z2 = module.y * Math.sin(this.cameraRotationX) + z * Math.cos(this.cameraRotationX);

            // Apply perspective
            const scale = this.zoomLevel * (800 / (800 + z2));
            const screenX = this.canvas.width / 2 + x * scale;
            const screenY = this.canvas.height / 2 + y * scale;

            // Skip if outside canvas
            if (screenX < -100 || screenX > this.canvas.width + 100 ||
                screenY < -100 || screenY > this.canvas.height + 100) {
                return;
            }

            // Calculate font size based on z-position and zoom
            const fontSize = Math.max(10, 20 * scale * this.fontSizeMultiplier);

            // Set text properties
            this.ctx.font = `${fontSize}px Heebo, sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // Determine text color based on mode and module status
            if (this.isDarkMode) {
                if (module === this.hoveredModule) {
                    this.ctx.fillStyle = '#ffcc00';
                } else if (module === this.selectedModule) {
                    this.ctx.fillStyle = '#ff6600';
                } else if (module.isPremium && this.userTier === 'free') {
                    this.ctx.fillStyle = '#888888'; // Grayed out for premium modules in free tier
                } else {
                    this.ctx.fillStyle = '#ffffff';
                }
            } else {
                if (module === this.hoveredModule) {
                    this.ctx.fillStyle = '#ff6600';
                } else if (module === this.selectedModule) {
                    this.ctx.fillStyle = '#cc3300';
                } else if (module.isPremium && this.userTier === 'free') {
                    this.ctx.fillStyle = '#888888'; // Grayed out for premium modules in free tier
                } else {
                    this.ctx.fillStyle = '#000000';
                }
            }

            // Draw module name
            this.ctx.fillText(module.name, screenX, screenY);

            // Draw edit/delete indicators if in those modes
            if ((this.isEditMode || this.isDeleteMode) && module === this.hoveredModule) {
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, fontSize * 0.8, 0, Math.PI * 2);
                this.ctx.strokeStyle = this.isDeleteMode ? '#ff0000' : '#00ff00';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        });
    }

    handleModuleHover(mouseX, mouseY) {
        // Find module under mouse cursor
        const hoveredModule = this.findModuleAtPosition(mouseX, mouseY);
        
        if (hoveredModule !== this.hoveredModule) {
            this.hoveredModule = hoveredModule;
            
            if (hoveredModule) {
                // Show tooltip with module info
                this.tooltipElement.innerHTML = `
                    <strong>${hoveredModule.name}</strong><br>
                    ${hoveredModule.categories.join(', ')}<br>
                    ${hoveredModule.isPremium ? '⭐ Premium' : ''}
                `;
                this.tooltipElement.style.display = 'block';
                this.tooltipElement.style.left = `${mouseX + 10}px`;
                this.tooltipElement.style.top = `${mouseY + 10}px`;
            } else {
                // Hide tooltip
                this.tooltipElement.style.display = 'none';
            }
        } else if (hoveredModule) {
            // Update tooltip position
            this.tooltipElement.style.left = `${mouseX + 10}px`;
            this.tooltipElement.style.top = `${mouseY + 10}px`;
        }
    }

    handleModuleClick(mouseX, mouseY) {
        const clickedModule = this.findModuleAtPosition(mouseX, mouseY);
        
        if (!clickedModule) return;
        
        // Handle edit mode
        if (this.isEditMode) {
            this.editModule(clickedModule);
            return;
        }
        
        // Handle delete mode
        if (this.isDeleteMode) {
            this.deleteModule(clickedModule);
            return;
        }
        
        // Handle premium module click for free users
        if (clickedModule.isPremium && this.userTier === 'free') {
            // Show premium upgrade modal
            document.getElementById('premiumModal').style.display = 'block';
            return;
        }
        
        // Regular click - open module URL
        this.selectedModule = clickedModule;
        window.open(clickedModule.url, '_blank');
    }

    findModuleAtPosition(mouseX, mouseY) {
        // Apply camera transformations to all modules and find the one under cursor
        for (const module of this.modules) {
            if (!module.visible) continue;
            
            // Apply camera transformations
            const x = module.x * Math.cos(this.cameraRotationY) - module.z * Math.sin(this.cameraRotationY);
            const z = module.x * Math.sin(this.cameraRotationY) + module.z * Math.cos(this.cameraRotationY);
            const y = module.y * Math.cos(this.cameraRotationX) - z * Math.sin(this.cameraRotationX);
            const z2 = module.y * Math.sin(this.cameraRotationX) + z * Math.cos(this.cameraRotationX);

            // Apply perspective
            const scale = this.zoomLevel * (800 / (800 + z2));
            const screenX = this.canvas.width / 2 + x * scale;
            const screenY = this.canvas.height / 2 + y * scale;
            
            // Calculate font size for hit testing
            const fontSize = Math.max(10, 20 * scale * this.fontSizeMultiplier);
            const hitRadius = fontSize * module.name.length * 0.25; // Approximate width based on text length
            
            // Check if mouse is within hit area
            const distance = Math.sqrt(Math.pow(mouseX - screenX, 2) + Math.pow(mouseY - screenY, 2));
            if (distance < hitRadius) {
                return module;
            }
        }
        
        return null;
    }

    addNewModule() {
        const name = document.getElementById('moduleName').value;
        const url = document.getElementById('moduleUrl').value;
        const categoriesInput = document.getElementById('moduleCategories').value;
        
        if (!name || !url || !categoriesInput) {
            alert('Please fill in all fields');
            return;
        }
        
        // Parse categories and scores
        const categoryPairs = categoriesInput.split(',').map(pair => pair.trim());
        const categories = [];
        const scores = {};
        
        categoryPairs.forEach(pair => {
            const [category, score] = pair.split(':').map(item => item.trim());
            categories.push(category);
            scores[category] = parseFloat(score) / 100; // Convert to 0-1 range
        });
        
        // Create new module
        const newModule = new AIModule(name, categories, url, scores);
        this.modules.push(newModule);
        
        // Reposition modules
        this.positionModules();
        
        // Clear form
        document.getElementById('moduleName').value = '';
        document.getElementById('moduleUrl').value = '';
        document.getElementById('moduleCategories').value = '';
        
        // Hide dropdown
        document.querySelector('#addModule + .dropdown-content').classList.remove('show');
    }

    editModule(module) {
        // Populate edit form
        document.getElementById('editModuleName').value = module.name;
        document.getElementById('editModuleUrl').value = module.url;
        
        // Format categories and scores
        const categoryScores = Object.entries(module.scores)
            .map(([category, score]) => `${category}:${Math.round(score * 100)}`)
            .join(', ');
        document.getElementById('editModuleCategories').value = categoryScores;
        
        // Show edit dropdown
        document.getElementById('editModuleDropdown').classList.add('show');
        
        // Store reference to module being edited
        this.selectedModule = module;
    }

    updateModule() {
        if (!this.selectedModule) return;
        
        const name = document.getElementById('editModuleName').value;
        const url = document.getElementById('editModuleUrl').value;
        const categoriesInput = document.getElementById('editModuleCategories').value;
        
        if (!name || !url || !categoriesInput) {
            alert('Please fill in all fields');
            return;
        }
        
        // Parse categories and scores
        const categoryPairs = categoriesInput.split(',').map(pair => pair.trim());
        const categories = [];
        const scores = {};
        
        categoryPairs.forEach(pair => {
            const [category, score] = pair.split(':').map(item => item.trim());
            categories.push(category);
            scores[category] = parseFloat(score) / 100; // Convert to 0-1 range
        });
        
        // Update module
        this.selectedModule.name = name;
        this.selectedModule.url = url;
        this.selectedModule.categories = categories;
        this.selectedModule.scores = scores;
        
        // Reposition modules
        this.positionModules();
        
        // Clear form and hide dropdown
        document.getElementById('editModuleDropdown').classList.remove('show');
        this.selectedModule = null;
        this.isEditMode = false;
        document.getElementById('editModule').classList.remove('active');
    }

    deleteModule(module) {
        if (confirm(`Are you sure you want to delete ${module.name}?`)) {
            // Remove module from array
            const index = this.modules.indexOf(module);
            if (index !== -1) {
                this.modules.splice(index, 1);
            }
            
            // Reposition modules
            this.positionModules();
            
            // Exit delete mode
            this.isDeleteMode = false;
            document.getElementById('deleteModule').classList.remove('active');
        }
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        
        if (this.isDarkMode) {
            this.bgColor = '#1a1a1a';
            document.getElementById('bgColor').value = '#1a1a1a';
        } else {
            this.bgColor = '#ffffff';
            document.getElementById('bgColor').value = '#ffffff';
        }
        
        document.body.style.backgroundColor = this.bgColor;
    }

    saveModulesToFile() {
        // Create JSON representation of modules
        const modulesData = this.modules.map(module => ({
            name: module.name,
            categories: module.categories,
            url: module.url,
            scores: module.scores,
            is_premium: module.isPremium
        }));
        
        // Create blob and download link
        const blob = new Blob([JSON.stringify(modulesData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai_modules.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    loadModulesFromFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const modulesData = JSON.parse(e.target.result);
                
                // Create modules from data
                this.modules = modulesData.map(data => 
                    new AIModule(
                        data.name, 
                        data.categories, 
                        data.url, 
                        data.scores,
                        data.is_premium || false
                    )
                );
                
                // Reposition modules
                this.positionModules();
                
                console.log(`Loaded ${this.modules.length} modules from file`);
            } catch (error) {
                console.error('Error parsing modules file:', error);
                alert('Error loading modules file. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// No need to initialize Supabase client here as it's already done in index.html

document.addEventListener('DOMContentLoaded', function() {
    // Set default to light mode
    document.body.classList.add('light-mode');
    document.body.style.backgroundColor = '#ffffff';

    // Check if the user is authenticated
    checkAuthenticationStatus().then(isAuthenticated => {
        if (!isAuthenticated) {
            // Do not show the modal here
            // document.getElementById('authModal').style.display = 'block'; // Remove this line
        } else {
            // Load the module cloud if authenticated
            checkUserTierAndLoadModules();
        }
    });

    // Event listeners for sign in and sign up buttons
    document.getElementById('signInButton').addEventListener('click', signIn);
    document.getElementById('signUpButton').addEventListener('click', signUp);

    // Event listener for login button
    document.getElementById('loginButton').addEventListener('click', () => {
        document.getElementById('authModal').style.display = 'block'; // Show the modal on button click
    });

    // Close modal functionality
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });

    // Premium request button
    document.getElementById('requestPremium').addEventListener('click', () => {
        window.location.href = 'mailto:Eyalizenman@gmail.com?subject=Premium%20Access%20Request&body=I%20would%20like%20to%20upgrade%20to%20premium%20access%20for%20$5%20lifetime%20fee.';
    });

    // Language selector buttons
    const languageToggleBtn = document.getElementById('languageToggle');
    if (languageToggleBtn) {
        languageToggleBtn.addEventListener('click', () => {
            cycleLanguage();
            console.log('Language toggled');
        });
    } else {
        console.error('Language toggle button not found');
    }

    // Initialize language
    initializeLanguage();
    
    // Setup dark mode toggle
    setupDarkModeToggle();
    
    // Add admin tools if user has admin rights
    addAdminTools();
});

async function checkAuthenticationStatus() {
    const { data: { session } } = await window.supabase.auth.getSession();
    return !!session;
}

async function signUp() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
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
            console.log('Sign up successful:', data);
        }
    } catch (err) {
        console.error('Exception during sign up:', err);
        alert('An error occurred during sign up. Please try again.');
    }
}

async function signIn() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    if (!email || !password) {
        alert('Please enter both email and password');
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
            console.log('Sign in successful:', data);
            // Hide the auth modal
            document.getElementById('authModal').style.display = 'none';
            // Check if user is premium and load appropriate modules
            checkUserTierAndLoadModules();
        }
    } catch (err) {
        console.error('Exception during sign in:', err);
        alert('An error occurred during sign in. Please try again.');
    }
}

async function checkUserTierAndLoadModules() {
    try {
        // Get current user
        const { data: { user } } = await window.supabase.auth.getUser();
        
        if (!user) {
            console.log('No authenticated user found');
            loadModuleCloud(false); // Load free tier
            return;
        }
        
        console.log('Loading module cloud for authenticated user');
        
        // Check if user is premium directly from auth metadata
        // This avoids the need for a separate users table
        const isPremium = user.user_metadata?.is_premium === true;
        console.log(`User is ${isPremium ? 'premium' : 'free'} tier`);
        
        // Load module cloud with appropriate tier
        loadModuleCloud(isPremium);
        
        // Show welcome message
        showWelcomeMessage(user.email, isPremium);
        
        // Update UI to reflect premium status
        if (isPremium) {
            // Add premium indicator to UI
            const loginButton = document.getElementById('loginButton');
            loginButton.innerHTML = '⭐ Premium';
            loginButton.classList.add('premium-user');
        } else {
            // Add upgrade button for non-premium users
            addUpgradeButton();
        }
    } catch (error) {
        console.error('Error in checkUserTierAndLoadModules:', error);
        loadModuleCloud(false); // Default to free tier on error
    }
}

function loadModuleCloud(isPremium = false) {
    // Initialize the module cloud
    window.moduleCloud = new ModuleCloud();
    
    // Set user tier
    window.moduleCloud.userTier = isPremium ? 'premium' : 'free';
    
    // Load appropriate modules
    if (isPremium) {
        console.log('Loading premium tier modules');
        window.moduleCloud.loadModules(); // This will load premium modules
    } else {
        console.log('Loading free tier modules');
        window.moduleCloud.loadDefaultModules(); // This will load limited free modules
    }
}

function setupDarkModeToggle() {
    const toggleButton = document.getElementById('toggleMode');
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            document.body.style.backgroundColor = '#1a1a1a';
            document.getElementById('bgColor').value = '#1a1a1a';
        } else {
            document.body.style.backgroundColor = '#ffffff';
            document.getElementById('bgColor').value = '#ffffff';
        }
        
        // Update module cloud if it exists
        if (window.moduleCloud) {
            window.moduleCloud.isDarkMode = document.body.classList.contains('dark-mode');
            window.moduleCloud.bgColor = document.body.style.backgroundColor;
        }
    });
}
