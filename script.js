// script.js
// Revised version with fixes for ModuleCloud rendering and UI event handling

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
        if (selectedCategories.has('all')) {
            const scores = Object.values(this.scores);
            return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 1;
        }
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

        // Initialize modules from defaultModules (provided via modules.js)
        if (window.defaultModules && Array.isArray(window.defaultModules) && window.defaultModules.length > 0) {
            console.log('Found defaultModules in window, initializing with them');
            this.initializeWithDefaultModules(window.defaultModules);
        }

        // Expose globally for easy access
        window.moduleCloud = this;

        this.setupEventListeners();
        this.resizeCanvas();
        this.loadModules();
        
        // Log the state for debugging
        console.log(`ModuleCloud initialized with ${this.modules.length} modules, userTier: ${this.userTier}`);
        
        this.animate();
    }
    
    // Create module objects from data
    initializeWithDefaultModules(modulesData) {
        if (!modulesData || !Array.isArray(modulesData)) {
            console.error('Invalid default modules data:', modulesData);
            return;
        }
        console.log(`Initializing with ${modulesData.length} default modules`);
        const defaultModules = modulesData.map(data => 
            new AIModule(
                data.name, 
                data.categories, 
                data.url, 
                data.scores,
                data.is_premium || false
            )
        );
        this.defaultModules = defaultModules;
    }

    loadModules() {
        console.log('Loading modules');
        if (this.modules && this.modules.length > 0) {
            console.log(`Already have ${this.modules.length} modules loaded, skipping reload`);
            this.positionModules();
            return;
        }
        
        if (this.defaultModules && this.defaultModules.length > 0) {
            console.log(`Using ${this.defaultModules.length} default modules from initialization`);
            this.modules = [...this.defaultModules];
            this.positionModules();
            return;
        }
        
        if (window.defaultModules && Array.isArray(window.defaultModules)) {
            console.log(`Using ${window.defaultModules.length} modules from window.defaultModules`);
            this.modules = window.defaultModules.map(module => 
                new AIModule(
                    module.name, 
                    module.categories, 
                    module.url, 
                    module.scores,
                    module.is_premium || false
                )
            );
            this.positionModules();
            console.log(`Successfully loaded ${this.modules.length} modules, positioning them now`);
            return;
        }
        
        console.warn('No modules available, initializing with empty array');
        this.modules = [];
        this.positionModules();
    }

    async checkUserPremiumStatus() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('No authenticated user found');
                return false;
            }
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
        
        // Canvas mouse events for dragging and hover
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
                document.querySelectorAll('.sidebar button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.selectedCategories.clear();
                this.selectedCategories.add(category);
                this.positionModules();
            });
        });

        // Sidebar toggle - Remove any existing listeners first
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebarContainer = document.querySelector('.sidebar-container');
        if (sidebarToggle && sidebarContainer) {
            // Remove existing listener to avoid duplicates
            const oldToggle = sidebarToggle.cloneNode(true);
            if (sidebarToggle.parentNode) {
                sidebarToggle.parentNode.replaceChild(oldToggle, sidebarToggle);
            }
            
            // Add new listener
            oldToggle.addEventListener('click', () => {
                sidebarContainer.classList.toggle('collapsed');
                console.log('Sidebar toggled:', sidebarContainer.classList.contains('collapsed') ? 'collapsed' : 'expanded');
            });
        } else {
            console.error('Sidebar elements not found:', { toggle: !!sidebarToggle, container: !!sidebarContainer });
        }

        // Font size controls
        document.getElementById('increaseFontSize')?.addEventListener('click', () => {
            this.fontSizeMultiplier += 0.1;
        });
        document.getElementById('decreaseFontSize')?.addEventListener('click', () => {
            this.fontSizeMultiplier = Math.max(0.5, this.fontSizeMultiplier - 0.1);
        });

        // Module management buttons
        document.getElementById('addModule')?.addEventListener('click', () => {
            document.querySelector('#addModule + .dropdown-content')?.classList.toggle('show');
        });
        document.getElementById('moduleForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewModule();
        });
        document.getElementById('deleteModule')?.addEventListener('click', () => {
            this.isDeleteMode = !this.isDeleteMode;
            this.isEditMode = false;
            document.getElementById('deleteModule')?.classList.toggle('active');
            document.getElementById('editModule')?.classList.remove('active');
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

        // Background color picker and dark mode toggle
        document.getElementById('bgColor')?.addEventListener('input', (e) => {
            this.bgColor = e.target.value;
            document.body.style.backgroundColor = this.bgColor;
        });
        document.getElementById('toggleMode')?.addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Save and load index buttons
        document.getElementById('saveIndex')?.addEventListener('click', () => {
            this.saveModulesToFile();
        });
        const loadIndexBtn = document.getElementById('loadIndex');
        if (loadIndexBtn) {
            loadIndexBtn.addEventListener('click', () => {
                const fileInput = document.getElementById('fileInput');
                if (fileInput) {
                    fileInput.value = '';
                    fileInput.accept = '.json';  // Set to accept JSON files explicitly
                    fileInput.click();
                    console.log('File input clicked');
                } else {
                    console.error('File input element not found');
                }
            });
        } else {
            console.error('Load index button not found');
        }
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            // Update the accept attribute
            fileInput.accept = '.json';
            
            // Remove existing listener
            const newFileInput = fileInput.cloneNode(true);
            fileInput.parentNode.replaceChild(newFileInput, fileInput);
            
            // Add new listener
            newFileInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    console.log('Selected file:', file.name);
                    this.loadModulesFromFile(file);
                } else {
                    console.log('No file selected');
                }
            });
        } else {
            console.error('File input not found for event handler');
        }

        // Premium upgrade button
        document.getElementById('requestPremium')?.addEventListener('click', () => {
            window.location.href = 'mailto:Eyalizenman@gmail.com?subject=Premium%20Access%20Request&body=I%20would%20like%20to%20upgrade%20to%20premium%20access%20for%20$5%20lifetime%20fee.';
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Position modules in a 3D sphere
    positionModules() {
        const visibleModules = this.modules.filter(module => {
            if (this.selectedCategories.has('all')) return true;
            return module.categories.some(category => this.selectedCategories.has(category));
        });
        const radius = 500;
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
        visibleModules.forEach((module, i) => {
            const y = 1 - (i / (visibleModules.length - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phi * i;
            module.targetX = radius * radiusAtY * Math.cos(theta);
            module.targetY = radius * y;
            module.targetZ = radius * radiusAtY * Math.sin(theta);
            if (module.x === 0 && module.y === 0 && module.z === 0) {
                module.x = module.targetX;
                module.y = module.targetY;
                module.z = module.targetZ;
            }
            module.visible = true;
        });
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
        // Sort modules by z for proper rendering
        const sortedModules = [...this.modules].filter(module => module.visible).sort((a, b) => b.z - a.z);
        sortedModules.forEach(module => {
            // Apply camera transformations
            const x = module.x * Math.cos(this.cameraRotationY) - module.z * Math.sin(this.cameraRotationY);
            const z = module.x * Math.sin(this.cameraRotationY) + module.z * Math.cos(this.cameraRotationY);
            const y = module.y * Math.cos(this.cameraRotationX) - z * Math.sin(this.cameraRotationX);
            const z2 = module.y * Math.sin(this.cameraRotationX) + z * Math.cos(this.cameraRotationX);
            const scale = this.zoomLevel * (800 / (800 + z2));
            const screenX = this.canvas.width / 2 + x * scale;
            const screenY = this.canvas.height / 2 + y * scale;
            if (screenX < -100 || screenX > this.canvas.width + 100 || screenY < -100 || screenY > this.canvas.height + 100) return;
            const fontSize = Math.max(10, 20 * scale * this.fontSizeMultiplier);
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
                    this.ctx.fillStyle = '#888888';
                } else {
                    this.ctx.fillStyle = '#ffffff';
                }
            } else {
                if (module === this.hoveredModule) {
                    this.ctx.fillStyle = '#ff6600';
                } else if (module === this.selectedModule) {
                    this.ctx.fillStyle = '#cc3300';
                } else if (module.isPremium && this.userTier === 'free') {
                    this.ctx.fillStyle = '#888888';
                } else {
                    this.ctx.fillStyle = '#000000';
                }
            }
            this.ctx.fillText(module.name, screenX, screenY);
            // Draw indicators if in edit/delete mode
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
        const hoveredModule = this.findModuleAtPosition(mouseX, mouseY);
        if (hoveredModule !== this.hoveredModule) {
            this.hoveredModule = hoveredModule;
            if (hoveredModule) {
                this.tooltipElement.innerHTML = `
                    <strong>${hoveredModule.name}</strong><br>
                    ${hoveredModule.categories.join(', ')}<br>
                    ${hoveredModule.isPremium ? '⭐ Premium' : ''}
                `;
                this.tooltipElement.style.display = 'block';
                this.tooltipElement.style.left = `${mouseX + 10}px`;
                this.tooltipElement.style.top = `${mouseY + 10}px`;
            } else {
                this.tooltipElement.style.display = 'none';
            }
        } else if (hoveredModule) {
            this.tooltipElement.style.left = `${mouseX + 10}px`;
            this.tooltipElement.style.top = `${mouseY + 10}px`;
        }
    }

    handleModuleClick(mouseX, mouseY) {
        const clickedModule = this.findModuleAtPosition(mouseX, mouseY);
        if (!clickedModule) return;
        if (this.isEditMode) {
            this.editModule(clickedModule);
            return;
        }
        if (this.isDeleteMode) {
            this.deleteModule(clickedModule);
            return;
        }
        if (clickedModule.isPremium && this.userTier === 'free') {
            document.getElementById('premiumModal').style.display = 'block';
            return;
        }
        this.selectedModule = clickedModule;
        window.open(clickedModule.url, '_blank');
    }

    findModuleAtPosition(mouseX, mouseY) {
        for (const module of this.modules) {
            if (!module.visible) continue;
            const x = module.x * Math.cos(this.cameraRotationY) - module.z * Math.sin(this.cameraRotationY);
            const z = module.x * Math.sin(this.cameraRotationY) + module.z * Math.cos(this.cameraRotationY);
            const y = module.y * Math.cos(this.cameraRotationX) - z * Math.sin(this.cameraRotationX);
            const z2 = module.y * Math.sin(this.cameraRotationX) + z * Math.cos(this.cameraRotationX);
            const scale = this.zoomLevel * (800 / (800 + z2));
            const screenX = this.canvas.width / 2 + x * scale;
            const screenY = this.canvas.height / 2 + y * scale;
            const fontSize = Math.max(10, 20 * scale * this.fontSizeMultiplier);
            const hitRadius = fontSize * module.name.length * 0.25;
            const distance = Math.sqrt(Math.pow(mouseX - screenX, 2) + Math.pow(mouseY - screenY, 2));
            if (distance < hitRadius) return module;
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
        const categoryPairs = categoriesInput.split(',').map(pair => pair.trim());
        const categories = [];
        const scores = {};
        categoryPairs.forEach(pair => {
            const [category, score] = pair.split(':').map(item => item.trim());
            categories.push(category);
            scores[category] = parseFloat(score) / 100;
        });
        const newModule = new AIModule(name, categories, url, scores);
        this.modules.push(newModule);
        this.positionModules();
        document.getElementById('moduleName').value = '';
        document.getElementById('moduleUrl').value = '';
        document.getElementById('moduleCategories').value = '';
        document.querySelector('#addModule + .dropdown-content').classList.remove('show');
    }

    editModule(module) {
        document.getElementById('editModuleName').value = module.name;
        document.getElementById('editModuleUrl').value = module.url;
        const categoryScores = Object.entries(module.scores)
            .map(([category, score]) => `${category}:${Math.round(score * 100)}`)
            .join(', ');
        document.getElementById('editModuleCategories').value = categoryScores;
        document.getElementById('editModuleDropdown').classList.add('show');
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
        const categoryPairs = categoriesInput.split(',').map(pair => pair.trim());
        const categories = [];
        const scores = {};
        categoryPairs.forEach(pair => {
            const [category, score] = pair.split(':').map(item => item.trim());
            categories.push(category);
            scores[category] = parseFloat(score) / 100;
        });
        this.selectedModule.name = name;
        this.selectedModule.url = url;
        this.selectedModule.categories = categories;
        this.selectedModule.scores = scores;
        this.positionModules();
        document.getElementById('editModuleDropdown').classList.remove('show');
        this.selectedModule = null;
        this.isEditMode = false;
        document.getElementById('editModule').classList.remove('active');
    }

    deleteModule(module) {
        if (confirm(`Are you sure you want to delete ${module.name}?`)) {
            const index = this.modules.indexOf(module);
            if (index !== -1) {
                this.modules.splice(index, 1);
            }
            this.positionModules();
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
        const modulesData = this.modules.map(module => ({
            name: module.name,
            categories: module.categories,
            url: module.url,
            scores: module.scores,
            is_premium: module.isPremium
        }));
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
        if (!file) {
            console.error('No file provided to loadModulesFromFile');
            return;
        }
        console.log('Loading modules from file:', file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target.result;
                const modulesData = JSON.parse(result);
                if (!Array.isArray(modulesData)) {
                    throw new Error('Invalid JSON format: expected an array of modules');
                }
                console.log(`Found ${modulesData.length} modules in the file`);
                this.modules = modulesData.map(data => 
                    new AIModule(
                        data.name || 'Unknown Module', 
                        data.categories || [], 
                        data.url || '#', 
                        data.scores || {},
                        data.is_premium || false
                    )
                );
                this.positionModules();
                console.log(`Successfully loaded ${this.modules.length} modules from file`);
                alert(`Successfully loaded ${this.modules.length} modules`);
            } catch (error) {
                console.error('Error parsing modules file:', error);
                alert('Error loading modules file: ' + error.message);
            }
        };
        reader.onerror = (error) => {
            console.error('Error reading file:', error);
            alert('Error reading file: ' + (error.message || 'Unknown error'));
        };
        reader.readAsText(file);
    }
}

// ---------- Global initialization and auth handling ----------

document.addEventListener('DOMContentLoaded', function() {
    // Set default light mode and background color
    document.body.classList.add('light-mode');
    document.body.style.backgroundColor = '#ffffff';
    // Initialize sidebar as collapsed by default
    const sidebarContainer = document.querySelector('.sidebar-container');
    if (sidebarContainer) sidebarContainer.classList.add('collapsed');
    
    // Check authentication status then load ModuleCloud accordingly
    checkAuthenticationStatus().then(isAuthenticated => {
        if (!isAuthenticated) {
            // Not authenticated: load free tier modules
            loadModuleCloud(false);
        } else {
            // Authenticated: check user tier and load modules
            checkUserTierAndLoadModules();
        }
    });

    // Event listeners for sign in and sign up
    document.getElementById('signInButton').addEventListener('click', signIn);
    document.getElementById('signUpButton').addEventListener('click', signUp);
    // Login button shows auth modal
    document.getElementById('loginButton').addEventListener('click', () => {
        document.getElementById('authModal').style.display = 'block';
    });
    // Close modal functionality
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });
    // Premium request button remains unchanged
    document.getElementById('requestPremium').addEventListener('click', () => {
        window.location.href = 'mailto:Eyalizenman@gmail.com?subject=Premium%20Access%20Request&body=I%20would%20like%20to%20upgrade%20to%20premium%20access%20for%20$5%20lifetime%20fee.';
    });
    // Language toggle button
    const languageToggleBtn = document.getElementById('languageToggle');
    if (languageToggleBtn) {
        languageToggleBtn.addEventListener('click', () => {
            cycleLanguage();
            console.log('Language toggled');
        });
    } else {
        console.error('Language toggle button not found');
    }
    // Initialize language and dark mode toggle
    initializeLanguage();
    setupDarkModeToggle();
    // Admin tools (if any)
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
        const { data, error } = await window.supabase.auth.signUp({ email, password });
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
        const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert('Error logging in: ' + error.message);
            console.error('Error logging in:', error.message);
        } else {
            console.log('Sign in successful:', data);
            document.getElementById('authModal').style.display = 'none';
            checkUserTierAndLoadModules();
        }
    } catch (err) {
        console.error('Exception during sign in:', err);
        alert('An error occurred during sign in. Please try again.');
    }
}

async function checkUserTierAndLoadModules() {
    try {
        const { data: { user } } = await window.supabase.auth.getUser();
        if (!user) {
            console.log('No authenticated user found');
            loadModuleCloud(false);
            return;
        }
        console.log('Loading module cloud for authenticated user');
        console.log('User metadata:', user.user_metadata);
        
        // Check premium status from user_metadata directly
        const isPremium = user.user_metadata?.is_premium === true;
        console.log(`User is ${isPremium ? 'premium' : 'free'} tier`);
        
        // If not found in metadata, check the users table directly
        if (!isPremium) {
            try {
                const { data, error } = await window.supabase
                    .from('users')
                    .select('is_premium')
                    .eq('id', user.id)
                    .single();
                
                if (error) {
                    console.error('Error fetching user data:', error);
                } else if (data) {
                    console.log('User data from database:', data);
                    const dbIsPremium = data.is_premium === true;
                    console.log(`User premium status from database: ${dbIsPremium}`);
                    
                    // Update user metadata if database shows premium but metadata doesn't
                    if (dbIsPremium && !isPremium) {
                        const { error: updateError } = await window.supabase.auth.updateUser({
                            data: { is_premium: true }
                        });
                        
                        if (updateError) {
                            console.error('Error updating user metadata:', updateError);
                        } else {
                            console.log('Updated user metadata to premium');
                        }
                    }
                    
                    // Use the database value for premium status
                    loadModuleCloud(dbIsPremium);
                    showWelcomeMessage(user.email, dbIsPremium);
                    if (dbIsPremium) {
                        const loginButton = document.getElementById('loginButton');
                        if (loginButton) {
                            loginButton.innerHTML = '⭐ Premium';
                            loginButton.classList.add('premium-user');
                        }
                    } else {
                        addUpgradeButton();
                    }
                    return;
                }
            } catch (dbError) {
                console.error('Exception checking database premium status:', dbError);
            }
        }
        
        // Fall back to metadata value if database check fails
        loadModuleCloud(isPremium);
        showWelcomeMessage(user.email, isPremium);
        if (isPremium) {
            const loginButton = document.getElementById('loginButton');
            if (loginButton) {
                loginButton.innerHTML = '⭐ Premium';
                loginButton.classList.add('premium-user');
            }
        } else {
            addUpgradeButton();
        }
    } catch (error) {
        console.error('Error in checkUserTierAndLoadModules:', error);
        loadModuleCloud(false);
    }
}

function loadModuleCloud(isPremium = false) {
    // Create the ModuleCloud instance only once
    if (!window.moduleCloud) {
        window.moduleCloud = new ModuleCloud();
    }
    window.moduleCloud.userTier = isPremium ? 'premium' : 'free';
    console.log(`Loading ${isPremium ? 'premium' : 'free'} tier modules`);
    
    // Reload modules to ensure correct permissions
    window.moduleCloud.loadModules();
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
        if (window.moduleCloud) {
            window.moduleCloud.isDarkMode = document.body.classList.contains('dark-mode');
            window.moduleCloud.bgColor = document.body.style.backgroundColor;
        }
    });
}
