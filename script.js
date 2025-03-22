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
            
            // First check user metadata
            const isPremiumFromMetadata = user.user_metadata?.is_premium === true;
            if (isPremiumFromMetadata) {
                console.log(`User premium status from metadata: true`);
                return true;
            }
            
            // Then check via the database module function
            if (window.moduleDatabase && typeof window.moduleDatabase.checkPremiumStatus === 'function') {
                const isPremiumFromDB = await window.moduleDatabase.checkPremiumStatus(user.id);
                console.log(`User premium status from database check: ${isPremiumFromDB}`);
                return isPremiumFromDB;
            }
            
            // Fallback to metadata check
            console.log(`User premium status from metadata fallback: ${isPremiumFromMetadata}`);
            return isPremiumFromMetadata || false;
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
                this.filterByCategory(category);
                
                // Update active state
                document.querySelectorAll('.sidebar button').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebarContainer = document.querySelector('.sidebar-container');
                if (sidebarContainer) {
                    sidebarContainer.classList.toggle('collapsed');
                    // Update toggle button text
                    sidebarToggle.textContent = sidebarContainer.classList.contains('collapsed') ? '❯' : '❮';
                }
            });
        }

        // Background color picker
        const bgColorPicker = document.getElementById('bgColor');
        if (bgColorPicker) {
            bgColorPicker.addEventListener('input', (e) => {
                this.bgColor = e.target.value;
                document.body.style.backgroundColor = this.bgColor;
            });
        }

        // Dark mode toggle
        const toggleModeButton = document.getElementById('toggleMode');
        if (toggleModeButton) {
            toggleModeButton.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }

        // Save index button
        const saveIndexButton = document.getElementById('saveIndex');
        if (saveIndexButton) {
            saveIndexButton.addEventListener('click', () => {
                this.saveModulesToFile();
            });
        }

        // Load index button
        const loadIndexButton = document.getElementById('loadIndex');
        if (loadIndexButton) {
            loadIndexButton.addEventListener('click', () => {
                document.getElementById('fileInput').click();
            });
        }

        // File input change
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.loadModulesFromFile(e.target.files[0]);
                }
            });
        }

        // Add module form
        const moduleForm = document.getElementById('moduleForm');
        if (moduleForm) {
            moduleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewModule();
            });
        }

        // Edit module form
        const editModuleForm = document.getElementById('editModuleForm');
        if (editModuleForm) {
            editModuleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateSelectedModule();
            });
        }

        // Delete module button
        const deleteModuleButton = document.getElementById('deleteModule');
        if (deleteModuleButton) {
            deleteModuleButton.addEventListener('click', () => {
                this.toggleDeleteMode();
            });
        }

        // Edit module button
        const editModuleButton = document.getElementById('editModule');
        if (editModuleButton) {
            editModuleButton.addEventListener('click', () => {
                this.toggleEditMode();
            });
        }
        
        // Bit payment button
        const copyBitNumberButton = document.getElementById('copyBitNumber');
        if (copyBitNumberButton) {
            copyBitNumberButton.addEventListener('click', () => {
                navigator.clipboard.writeText('+972 547731650')
                    .then(() => {
                        alert('Bit phone number copied to clipboard: +972 547731650');
                    })
                    .catch(err => {
                        console.error('Could not copy text: ', err);
                        alert('Please manually copy this number: +972 547731650');
                    });
            });
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.draw();
    }

    positionModules() {
        if (!this.modules || this.modules.length === 0) {
            console.warn('No modules to position');
            return;
        }
        
        console.log(`Positioning ${this.modules.length} modules in 3D space`);
        
        // Position modules in a sphere
        const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
        
        this.modules.forEach((module, i) => {
            const y = 1 - (i / (this.modules.length - 1)) * 2; // y goes from 1 to -1
            const radiusAtY = Math.sqrt(1 - y * y); // radius at y
            const theta = phi * i; // Golden angle increment
            
            module.targetX = radiusAtY * Math.cos(theta) * radius;
            module.targetY = y * radius;
            module.targetZ = radiusAtY * Math.sin(theta) * radius;
            
            // Initialize position at target
            module.x = module.targetX;
            module.y = module.targetY;
            module.z = module.targetZ;
            
            // Random rotation
            module.rotationX = Math.random() * Math.PI * 2;
            module.rotationY = Math.random() * Math.PI * 2;
        });
    }

    filterByCategory(category) {
        if (category === 'all') {
            this.selectedCategories = new Set(['all']);
        } else {
            this.selectedCategories.delete('all');
            if (this.selectedCategories.has(category)) {
                this.selectedCategories.delete(category);
                if (this.selectedCategories.size === 0) {
                    this.selectedCategories.add('all');
                }
            } else {
                this.selectedCategories.add(category);
            }
        }
        
        // Update module visibility
        this.modules.forEach(module => {
            if (this.selectedCategories.has('all')) {
                module.visible = true;
            } else {
                const moduleCategories = module.categories.split(',').map(c => c.trim());
                module.visible = moduleCategories.some(c => this.selectedCategories.has(c));
            }
        });
        
        // Reposition visible modules
        this.positionModules();
    }

    handleModuleHover(mouseX, mouseY) {
        // Project 3D positions to 2D screen coordinates
        const projectedModules = this.modules
            .filter(module => module.visible)
            .map(module => {
                const { x: screenX, y: screenY, z: screenZ } = this.project3DTo2D(module.x, module.y, module.z);
                return { module, screenX, screenY, screenZ };
            });
        
        // Sort by Z to handle overlapping
        projectedModules.sort((a, b) => a.screenZ - b.screenZ);
        
        // Find hovered module
        const hoverRadius = 50; // Hover detection radius
        let hoveredModule = null;
        
        for (let i = projectedModules.length - 1; i >= 0; i--) {
            const { module, screenX, screenY } = projectedModules[i];
            const distance = Math.sqrt(Math.pow(screenX - mouseX, 2) + Math.pow(screenY - mouseY, 2));
            
            if (distance < hoverRadius) {
                hoveredModule = module;
                break;
            }
        }
        
        // Update tooltip
        if (hoveredModule !== this.hoveredModule) {
            this.hoveredModule = hoveredModule;
            
            if (hoveredModule) {
                // Show tooltip with module info
                this.tooltipElement.innerHTML = `
                    <strong>${hoveredModule.name}</strong><br>
                    ${hoveredModule.categories}<br>
                    ${hoveredModule.isPremium ? '⭐ Premium' : ''}
                `;
                this.tooltipElement.style.left = `${mouseX + 10}px`;
                this.tooltipElement.style.top = `${mouseY + 10}px`;
                this.tooltipElement.classList.add('visible');
            } else {
                // Hide tooltip
                this.tooltipElement.classList.remove('visible');
            }
        } else if (hoveredModule) {
            // Update tooltip position
            this.tooltipElement.style.left = `${mouseX + 10}px`;
            this.tooltipElement.style.top = `${mouseY + 10}px`;
        }
    }

    handleModuleClick(mouseX, mouseY) {
        // Similar to hover detection but for clicks
        const projectedModules = this.modules
            .filter(module => module.visible)
            .map(module => {
                const { x: screenX, y: screenY, z: screenZ } = this.project3DTo2D(module.x, module.y, module.z);
                return { module, screenX, screenY, screenZ };
            });
        
        projectedModules.sort((a, b) => a.screenZ - b.screenZ);
        
        const clickRadius = 50;
        let clickedModule = null;
        
        for (let i = projectedModules.length - 1; i >= 0; i--) {
            const { module, screenX, screenY } = projectedModules[i];
            const distance = Math.sqrt(Math.pow(screenX - mouseX, 2) + Math.pow(screenY - mouseY, 2));
            
            if (distance < clickRadius) {
                clickedModule = module;
                break;
            }
        }
        
        if (clickedModule) {
            if (this.isDeleteMode) {
                // Delete the module
                this.deleteModule(clickedModule);
                this.isDeleteMode = false;
                document.getElementById('deleteModule').classList.remove('active');
            } else if (this.isEditMode) {
                // Edit the module
                this.selectedModule = clickedModule;
                this.populateEditForm(clickedModule);
                this.isEditMode = false;
                document.getElementById('editModule').classList.remove('active');
            } else {
                // Open the module URL
                if (clickedModule.isPremium && this.userTier !== 'premium') {
                    // Show premium upgrade modal
                    document.getElementById('premiumModal').style.display = 'block';
                } else {
                    // Open the URL
                    window.open(clickedModule.url, '_blank');
                }
            }
        }
    }

    project3DTo2D(x, y, z) {
        // Apply camera rotation
        const cosY = Math.cos(this.cameraRotationY);
        const sinY = Math.sin(this.cameraRotationY);
        const cosX = Math.cos(this.cameraRotationX);
        const sinX = Math.sin(this.cameraRotationX);
        
        const rotatedX = cosY * x - sinY * z;
        const rotatedZ = sinY * x + cosY * z;
        const rotatedY = cosX * y - sinX * rotatedZ;
        const finalZ = sinX * y + cosX * rotatedZ;
        
        // Apply perspective projection
        const focalLength = 500;
        const scale = focalLength / (focalLength + finalZ);
        
        const screenX = this.canvas.width / 2 + rotatedX * scale * this.zoomLevel;
        const screenY = this.canvas.height / 2 + rotatedY * scale * this.zoomLevel;
        
        return { x: screenX, y: screenY, z: finalZ };
    }

    draw() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update module positions
        this.modules.forEach(module => module.update());
        
        // Project and sort modules by Z for proper rendering
        const projectedModules = this.modules
            .filter(module => module.visible)
            .map(module => {
                const { x: screenX, y: screenY, z: screenZ } = this.project3DTo2D(module.x, module.y, module.z);
                return { module, screenX, screenY, screenZ };
            });
        
        projectedModules.sort((a, b) => a.screenZ - b.screenZ);
        
        // Draw modules
        projectedModules.forEach(({ module, screenX, screenY, screenZ }) => {
            // Calculate size based on Z position
            const baseSize = 20;
            const sizeScale = Math.max(0.5, Math.min(2, 1 + screenZ / 1000));
            const size = baseSize * sizeScale * this.zoomLevel;
            
            // Calculate opacity based on Z position
            const opacity = Math.max(0.3, Math.min(1, 1 - screenZ / 2000));
            
            // Calculate color based on score
            const score = module.getAverageScore(this.selectedCategories);
            const hue = 120 * score / 100; // Green for high scores, red for low
            
            // Draw module circle
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
            
            // Fill with gradient
            const gradient = this.ctx.createRadialGradient(
                screenX, screenY, 0,
                screenX, screenY, size
            );
            
            if (module === this.hoveredModule) {
                // Highlight hovered module
                gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${opacity})`);
                gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, ${opacity})`);
            } else {
                gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${opacity})`);
                gradient.addColorStop(1, `hsla(${hue}, 80%, 40%, ${opacity})`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Add premium indicator
            if (module.isPremium) {
                this.ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(screenX + size * 0.7, screenY - size * 0.7, size * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
                this.ctx.font = `${size * 0.4}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('⭐', screenX + size * 0.7, screenY - size * 0.7);
            }
            
            // Draw module name
            this.ctx.font = `${size * this.fontSizeMultiplier}px Arial`;
            this.ctx.fillStyle = this.isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(module.name, screenX, screenY);
        });
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        
        if (this.isDarkMode) {
            this.bgColor = '#121212';
            document.body.style.backgroundColor = this.bgColor;
            document.getElementById('bgColor').value = this.bgColor;
        } else {
            this.bgColor = '#ffffff';
            document.body.style.backgroundColor = this.bgColor;
            document.getElementById('bgColor').value = this.bgColor;
        }
    }

    toggleDeleteMode() {
        this.isDeleteMode = !this.isDeleteMode;
        document.getElementById('deleteModule').classList.toggle('active', this.isDeleteMode);
        this.isEditMode = false;
        document.getElementById('editModule').classList.remove('active');
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        document.getElementById('editModule').classList.toggle('active', this.isEditMode);
        this.isDeleteMode = false;
        document.getElementById('deleteModule').classList.remove('active');
    }

    deleteModule(module) {
        const index = this.modules.indexOf(module);
        if (index !== -1) {
            this.modules.splice(index, 1);
            this.positionModules();
            alert(`Module "${module.name}" deleted`);
        }
    }

    populateEditForm(module) {
        document.getElementById('editModuleName').value = module.name;
        document.getElementById('editModuleUrl').value = module.url;
        
        // Format categories and scores for the form
        const categoryScores = [];
        for (const category in module.scores) {
            categoryScores.push(`${category}:${module.scores[category]}`);
        }
        document.getElementById('editModuleCategories').value = categoryScores.join(', ');
        
        // Show the edit form dropdown
        document.getElementById('editModuleDropdown').style.display = 'block';
    }

    updateSelectedModule() {
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
        const categories = categoryPairs.map(pair => pair.split(':')[0]).join(', ');
        const scores = {};
        
        categoryPairs.forEach(pair => {
            const [category, score] = pair.split(':');
            scores[category.trim()] = parseInt(score.trim(), 10) || 50;
        });
        
        // Update the module
        this.selectedModule.name = name;
        this.selectedModule.url = url;
        this.selectedModule.categories = categories;
        this.selectedModule.scores = scores;
        
        // Hide the edit form dropdown
        document.getElementById('editModuleDropdown').style.display = 'none';
        this.selectedModule = null;
        
        alert('Module updated successfully');
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
        const categories = categoryPairs.map(pair => pair.split(':')[0]).join(', ');
        const scores = {};
        
        categoryPairs.forEach(pair => {
            const [category, score] = pair.split(':');
            scores[category.trim()] = parseInt(score.trim(), 10) || 50;
        });
        
        // Create new module
        const newModule = new AIModule(name, categories, url, scores, false);
        this.modules.push(newModule);
        
        // Reset form
        document.getElementById('moduleName').value = '';
        document.getElementById('moduleUrl').value = '';
        document.getElementById('moduleCategories').value = '';
        
        // Reposition modules
        this.positionModules();
        
        alert(`Module "${name}" added successfully`);
    }

    saveModulesToFile() {
        // Convert modules to JSON
        const modulesData = this.modules.map(module => ({
            name: module.name,
            categories: module.categories,
            url: module.url,
            scores: module.scores,
            is_premium: module.isPremium
        }));
        
        // Create a Blob with the JSON data
        const blob = new Blob([JSON.stringify(modulesData, null, 2)], { type: 'application/json' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai-modules.json';
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    loadModulesFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const modulesData = JSON.parse(e.target.result);
                
                // Create module objects
                this.modules = modulesData.map(data => 
                    new AIModule(
                        data.name, 
                        data.categories, 
                        data.url, 
                        data.scores,
                        data.is_premium || false
                    )
                );
                
                // Position modules
                this.positionModules();
                
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
    // Premium request button
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
        
        // Check premium status using the enhanced function in moduleDatabase
        let isPremium = false;
        
        if (window.moduleDatabase && typeof window.moduleDatabase.checkPremiumStatus === 'function') {
            isPremium = await window.moduleDatabase.checkPremiumStatus(user.id);
            console.log(`User premium status from moduleDatabase check: ${isPremium}`);
        } else {
            // Fallback to metadata check
            isPremium = user.user_metadata?.is_premium === true;
            console.log(`User premium status from metadata fallback: ${isPremium}`);
        }
        
        // Update UI based on premium status
        if (isPremium) {
            const loginButton = document.getElementById('loginButton');
            if (loginButton) {
                loginButton.innerHTML = '⭐ Premium';
                loginButton.classList.add('premium-user');
            }
        }
        
        // Load the module cloud with the correct tier
        loadModuleCloud(isPremium);
    } catch (error) {
        console.error('Error checking user tier:', error);
        loadModuleCloud(false);
    }
}

function loadModuleCloud(isPremium = false) {
    console.log(`Loading ModuleCloud with premium status: ${isPremium}`);
    
    // Initialize ModuleCloud if not already done
    if (!window.moduleCloud) {
        window.moduleCloud = new ModuleCloud();
    }
    
    // Set user tier
    window.moduleCloud.userTier = isPremium ? 'premium' : 'free';
    console.log(`Set ModuleCloud user tier to ${window.moduleCloud.userTier}`);
    
    // Update UI based on premium status
    if (isPremium) {
        const loginButton = document.getElementById('loginButton');
        if (loginButton) {
            loginButton.innerHTML = '⭐ Premium';
            loginButton.classList.add('premium-user');
        }
    }
}

function setupDarkModeToggle() {
    const toggleModeButton = document.getElementById('toggleMode');
    if (toggleModeButton) {
        toggleModeButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDarkMode = document.body.classList.contains('dark-mode');
            
            if (isDarkMode) {
                document.body.style.backgroundColor = '#121212';
                document.getElementById('bgColor').value = '#121212';
            } else {
                document.body.style.backgroundColor = '#ffffff';
                document.getElementById('bgColor').value = '#ffffff';
            }
            
            // Update ModuleCloud if it exists
            if (window.moduleCloud) {
                window.moduleCloud.isDarkMode = isDarkMode;
                window.moduleCloud.bgColor = isDarkMode ? '#121212' : '#ffffff';
            }
        });
    }
}

function addAdminTools() {
    // This function can be expanded to add admin-specific tools
    console.log('Admin tools initialized');
}

// Security enhancement - Add Content Security Policy header via meta tag
document.addEventListener('DOMContentLoaded', function() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self' https://cdn.jsdelivr.net https://*.supabase.co; script-src 'self' https://cdn.jsdelivr.net https://*.supabase.co 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-src 'none';";
    document.head.appendChild(meta);
});
