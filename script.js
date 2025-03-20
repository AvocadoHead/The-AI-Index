import { createClient } from '@supabase/supabase-js';

class AIModule {
    constructor(name, categories, url, scores = {}) {
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
        this.cloudSpread = 300;
        this.initialized = false;
        this.rotationX = 0;
        this.rotationY = 0;
        this.momentumX = 0;
        this.momentumY = 0;
        this.baseRotationX = 0.0003;
        this.baseRotationY = 0.0005;
        this.friction = 0.95;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isDragging = false;
        this.tooltip = document.getElementById('tooltip');
        this.autoRotationSpeedX = 0.0005;
        this.autoRotationSpeedY = 0.001;
        this.lastInteractionTime = 0;
        this.interactionTimeout = 3000;
        this.isAutoRotating = false;
        this.scale = 1;
        this.lastTouchDistance = 0;
        this.lastClickTime = 0;
        this.lastClickedModule = null;
        this.clickDelay = 300;
        
        // Initialize core functionality
        this.initializeCanvas();
        this.setupEventListeners();
        this.setupTouchEvents();
        
        // Initialize state
        this.activeModule = null;
        this.pinnedTooltip = false;
        this.moduleDescriptions = new Map();
        
        // Start animation loop
        this.animate();
        
        // Load modules if available
        if (typeof defaultModules !== 'undefined') {
            this.loadDefaultModules();
        }

        // Add font size properties
        this.baseFontSize = 14;
        this.fontSizeMultiplier = 1;
        
        // Setup text controls
        this.setupTextControls();

        // Add translations for categories
        this.categoryTranslations = {
            en: {
                all: 'All',
                LLM: 'LLM | Language Models',
                USE: 'USE | AI Tools',
                T2I: 'T2I | Text to Image',
                I2I: 'I2I | Image to Image',
                T2V: 'T2V | Text to Video',
                I2V: 'I2V | Image to Video',
                V2V: 'V2V | Video Repaint',
                '3D': '3D | 3D Tools',
                DES: 'DES | Design',
                UPS: 'UPS | Upscale/Enhance',
                AUD: 'AUD | Audio',
                VID: 'VID | Video Tools',
                'UI/UX': 'UI/UX',
                ANI: 'ANI | Animation',
                FCE: 'FCE | Face Editing',
                SEA: 'SEA | AI Search',
                CON: 'CON | Content Generation',
                PRE: 'PRE | Presentation Creation',
                I23: 'I23 | Image to 3D',
                T2S: 'T2S | Text to Speech',
                S2T: 'S2T | Speech to Text',
                VCL: 'VCL | Voice Cloning',
                MUS: 'MUS | Music Generation',
                DEV: 'DEV | Development',
                GAM: 'GAM | Gaming',
                ML: 'ML | Machine Learning'
            },
            he: {
                all: 'הכל',
                LLM: 'LLM | מודלי שפה',
                USE: 'USE | כלי AI',
                T2I: 'T2I | טקסט לתמונה',
                I2I: 'I2I | תמונה לתמונה',
                T2V: 'T2V | טקסט לוידאו',
                I2V: 'I2V | תמונה לוידאו',
                V2V: 'V2V | עריכת וידאו',
                '3D': '3D | כלי תלת מימד',
                DES: 'DES | עיצוב',
                UPS: 'UPS | שיפור איכות',
                AUD: 'AUD | שמע',
                VID: 'VID | כלי וידאו',
                'UI/UX': 'UI/UX | ממשק משתמש',
                ANI: 'ANI | אנימציה',
                FCE: 'FCE | עריכת פנים',
                SEA: 'SEA | חיפוש AI',
                CON: 'CON | יצירת תוכן',
                PRE: 'PRE | יצירת מצגות',
                I23: 'I23 | תמונה לתלת מימד',
                T2S: 'T2S | טקסט לדיבור',
                S2T: 'S2T | דיבור לטקסט',
                VCL: 'VCL | שכפול קול',
                MUS: 'MUS | יצירת מוזיקה',
                DEV: 'DEV | פיתוח',
                GAM: 'GAM | משחקים',
                ML: 'ML | למידת מכונה'
            }
        };
        
        // Setup sidebar toggle
        this.setupSidebarToggle();

        // Setup UI controls
        this.setupLanguageToggle();
        this.setupDarkModeToggle();

        this.translations = {
            en: {
                saveIndex: 'Save<br>Index',
                loadIndex: 'Load<br>Index',
                addModule: 'Add<br>Module',
                editModule: 'Edit<br>Module',
                deleteModule: 'Delete<br>Module'
            },
            he: {
                saveIndex: 'שמור<br>אינדקס',
                loadIndex: 'טען<br>אינדקס',
                addModule: 'הוסף<br>מודול',
                editModule: 'ערוך<br>מודול',
                deleteModule: 'מחק<br>מודול'
            }
        };

        this.descriptionCache = new Map();
    }

    loadDefaultModules() {
        console.log('Found modules file, attempting to load...');
        try {
            const moduleCount = defaultModules.length;
            console.log(`Total modules in file: ${moduleCount}`);
            
            this.modules = defaultModules
                .map((m, index) => {
                    if (!m.name || !m.categories || !m.url || !m.scores) {
                        console.warn(`Module at index ${index} is missing required fields:`, m);
                        return null;
                    }
                    const module = new AIModule(m.name, m.categories, m.url, m.scores);
                    this.positionModuleInCloud(module);
                    return module;
                })
                .filter(m => m !== null);
            
            console.log(`Successfully loaded ${this.modules.length} modules`);
            this.defaultModules = [...this.modules];
            this.initialized = true;
        } catch (error) {
            console.error('Error during module loading:', error);
            this.showError('Error loading modules');
        }
    }

    showError(message) {
        // Create or update error display
        const errorElement = document.getElementById('errorMessage') || document.createElement('div');
        errorElement.id = 'errorMessage';
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        if (!document.body.contains(errorElement)) {
            document.body.appendChild(errorElement);
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }

    positionModuleInCloud(module) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = this.cloudSpread + (Math.random() * (this.cloudSpread * 0.2));

        module.targetX = radius * Math.sin(phi) * Math.cos(theta);
        module.targetY = radius * Math.sin(phi) * Math.sin(theta);
        module.targetZ = radius * Math.cos(phi);
    }

    initializeCanvas() {
        const updateSize = () => {
            // Make canvas fill the screen while maintaining aspect ratio
            const devicePixelRatio = window.devicePixelRatio || 1;
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Set display size
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            
            // Set actual size in memory
            this.canvas.width = width * devicePixelRatio;
            this.canvas.height = height * devicePixelRatio;
            
            // Scale all drawing operations
            this.ctx.scale(devicePixelRatio, devicePixelRatio);

            // Adjust cloud spread based on screen size
            this.cloudSpread = Math.min(width, height) * 0.3; // Adjust cloud size relative to screen
        };
        
        window.addEventListener('resize', updateSize);
        updateSize();
    }

    setupEventListeners() {
        // Toggle mode button
        const toggleMode = document.getElementById('toggleMode');
        if (toggleMode) {
            toggleMode.onclick = () => {
                document.body.classList.toggle('light-mode');
                this.canvas.style.backgroundColor = document.body.classList.contains('light-mode') ? '#ffffff' : '#1a1a1a';
            };
        }

        // Save and load file buttons
        const saveFile = document.getElementById('saveIndex');
        const loadFile = document.getElementById('loadIndex');
        const fileInput = document.getElementById('fileInput');

        if (saveFile) {
            saveFile.onclick = () => this.saveModules();
        }

        if (loadFile && fileInput) {
            fileInput.setAttribute('accept', '.txt,.js,text/plain,text/javascript');
            loadFile.onclick = () => fileInput.click();
            fileInput.onchange = (event) => this.handleFileUpload(event);
        }

        // Module form handling
        const moduleForm = document.getElementById('moduleForm');
        if (moduleForm) {
            moduleForm.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('moduleName').value;
                const url = document.getElementById('moduleUrl').value;
                const categories = document.getElementById('moduleCategories').value;
                
                if (this.addNewModule(name, url, categories)) {
                    moduleForm.reset();
                    document.querySelector('.dropdown-content').classList.remove('show');
                }
            };
        }

        // Fix Add Module dropdown
        const addModuleBtn = document.getElementById('addModule');
        const dropdownContent = document.querySelector('.dropdown-content');
        if (addModuleBtn && dropdownContent) {
            addModuleBtn.onclick = (e) => {
                e.stopPropagation();
                dropdownContent.classList.toggle('show');
            };
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#addModule') && 
                    !e.target.closest('.dropdown-content')) {
                    dropdownContent.classList.remove('show');
                }
            });
        }

        // Category filtering with multi-select
        const categoryButtons = document.querySelectorAll('.sidebar button');
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = button.dataset.category;
                
                if (category === 'all') {
                    // 'All' button always clears other selections
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    this.modules = [...this.defaultModules];
                } else if (e.shiftKey) {
                    // Shift+click for multi-select
                    if (button.classList.contains('active')) {
                        button.classList.remove('active');
                    } else {
                        button.classList.add('active');
                        document.querySelector('.sidebar button[data-category="all"]')
                            ?.classList.remove('active');
                    }
                    
                    // Get all active categories
                    const activeCategories = Array.from(document.querySelectorAll('.sidebar button.active'))
                        .map(btn => btn.dataset.category);
                    
                    // Filter modules that match ANY of the selected categories
                    this.modules = this.defaultModules.filter(module => 
                        module.categories.some(cat => activeCategories.includes(cat))
                    );
                    
                    // If no categories selected, show all
                    if (activeCategories.length === 0) {
                        document.querySelector('.sidebar button[data-category="all"]')
                            ?.classList.add('active');
                        this.modules = [...this.defaultModules];
                    }
                } else {
                    // Normal click - single category
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    this.modules = this.defaultModules.filter(module => 
                        module.categories.includes(category)
                    );
                }

                // Reposition visible modules
                this.modules.forEach(module => this.positionModuleInCloud(module));
            });
        });

        // Mouse events for canvas
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                
                this.momentumX = deltaY * 0.005;
                this.momentumY = deltaX * 0.005;
                
                this.rotationX += this.momentumX;
                this.rotationY += this.momentumY;
                
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (!this.isDragging) {
                // It was a click, not a drag
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                this.handleModuleSelection(mouseX, mouseY);
            }
            
            // End drag state but don't clear selection/tooltip
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
            
            // Add final momentum
            const deltaTime = Date.now() - this.lastInteractionTime;
            if (deltaTime < 100) { // Only add momentum for quick movements
                this.momentumX *= 2; // Boost final momentum
                this.momentumY *= 2;
            }
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });

        // Resume auto-rotation when mouse is still
        let mouseTimeout;
        this.canvas.onmousemove = (e) => {
            this.handleMouseMove(e);
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                this.isAutoRotating = true;
            }, this.interactionTimeout);
        };

        // Background color control
        const bgColorPicker = document.getElementById('bgColor');
        if (bgColorPicker) {
            bgColorPicker.onchange = (e) => {
                this.canvas.style.backgroundColor = e.target.value;
                document.body.style.backgroundColor = e.target.value;
            };
            
            // Set initial background color
            this.canvas.style.backgroundColor = bgColorPicker.value;
            document.body.style.backgroundColor = bgColorPicker.value;
        }

        // Update canvas click handler
        this.canvas.onclick = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const clickedModule = this.getHoveredModule(mouseX, mouseY);
            const editModuleBtn = document.getElementById('editModule');
            
            if (clickedModule) {
                if (this.activeModule === clickedModule) {
                    // Second click - open URL
                    if (clickedModule.url) {
                        window.open(clickedModule.url, '_blank');
                    }
                } else {
                    // First click or new module selection
                    this.activeModule = clickedModule;
                    editModuleBtn.disabled = false;
                    editModuleBtn.style.opacity = '1';
                    
                    // Show new tooltip
                    this.pinnedTooltip = true;
                    this.showTooltip(clickedModule, e.clientX, e.clientY);
                }
            } else {
                // Only close on definitive click outside
                if (!this.isDragging) {
                    this.activeModule = null;
                    this.pinnedTooltip = false;
                    editModuleBtn.disabled = true;
                    editModuleBtn.style.opacity = '0.5';
                    this.hideTooltip();
                }
            }
        };

        // Add touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.isDragging = true;
            this.lastMouseX = touch.clientX - this.canvas.getBoundingClientRect().left;
            this.lastMouseY = touch.clientY - this.canvas.getBoundingClientRect().top;
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDragging) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = touch.clientX - rect.left;
                const mouseY = touch.clientY - rect.top;

                const deltaX = mouseX - this.lastMouseX;
                const deltaY = mouseY - this.lastMouseY;
                
                // Adjust sensitivity for touch
                this.momentumX = deltaY * 0.0015;
                this.momentumY = deltaX * 0.0015;
                
                this.rotationX += this.momentumX;
                this.rotationY += this.momentumY;

                // Handle tooltip for touch
                const hoveredModule = this.getHoveredModule(mouseX, mouseY);
                if (hoveredModule) {
                    this.showTooltip(hoveredModule, touch.clientX, touch.clientY);
                } else {
                    this.hideTooltip();
                }

                this.lastMouseX = mouseX;
                this.lastMouseY = mouseY;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - this.touchStartTime;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            // Calculate total movement
            const totalMovement = Math.abs(touchEndX - this.touchStartX) + 
                                Math.abs(touchEndY - this.touchStartY);

            if (touchDuration < 1000 && totalMovement < 10) {  // Handle taps
                const rect = this.canvas.getBoundingClientRect();
                const x = touchEndX - rect.left;
                const y = touchEndY - rect.top;
                
                const tappedModule = this.getHoveredModule(x, y);
                
                if (tappedModule) {
                    if (this.activeModule !== tappedModule) {
                        this.activeModule = tappedModule;
                        this.showTooltip(tappedModule, touchEndX, touchEndY);
                        // Enable edit button on selection
                        const editButton = document.getElementById('editModule');
                        if (editButton) {
                            editButton.disabled = false;
                            editButton.classList.remove('disabled');
                            editButton.style.opacity = '1';
                        }
                    } else if (touchDuration > 800) {
                        if (tappedModule.url) {
                            window.open(tappedModule.url, '_blank');
                        }
                    }
                } else {
                    this.handleModuleSelection(x, y);  // This will handle deselection
                    this.hideTooltip();
                }
            }

            // Always apply momentum for swipes
            const dx = touchEndX - this.touchStartX;
            const dy = touchEndY - this.touchStartY;
            
            const momentumMultiplier = 0.001;
            this.momentumX = dy * momentumMultiplier;
            this.momentumY = dx * momentumMultiplier;
            
            const maxMomentum = 0.02;
            this.momentumX = Math.max(Math.min(this.momentumX, maxMomentum), -maxMomentum);
            this.momentumY = Math.max(Math.min(this.momentumY, maxMomentum), -maxMomentum);
        });

        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target === this.canvas) {
                e.preventDefault();
            }
        }, { passive: false });

        // Handle device orientation if available
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => {
                if (!this.isDragging) {
                    const tiltSpeed = 0.0002;
                    this.momentumX = e.beta * tiltSpeed;
                    this.momentumY = e.gamma * tiltSpeed;
                }
            });
        }

        // Delete module button
        const deleteModuleBtn = document.getElementById('deleteModule');
        if (deleteModuleBtn) {
            deleteModuleBtn.onclick = () => {
                if (this.activeModule) {
                    if (confirm(`Are you sure you want to delete "${this.activeModule.name}"?`)) {
                        this.deleteModule(this.activeModule.name);
                        this.activeModule = null;
                        this.pinnedTooltip = false;
                        this.hideTooltip();
                        document.getElementById('editModule').disabled = true;
                    }
                }
            };
        }

        // Add mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Get zoom direction and calculate delta
            const delta = -e.deltaY * 0.001; // Adjust sensitivity here
            
            // Apply zoom with the same limits as pinch
            this.scale *= (1 + delta);
            this.scale = Math.max(0.5, Math.min(2, this.scale));
            
        }, { passive: false });

        // Fix Edit Module dropdown functionality
        const editModuleBtn = document.getElementById('editModule');
        const editDropdown = document.getElementById('editModuleDropdown');

        if (editModuleBtn) {
            editModuleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!this.activeModule) return; // Don't do anything if no module is selected
                
                // Toggle dropdown visibility
                if (editDropdown) {
                    editDropdown.classList.toggle('show');
                    
                    // Populate form with active module data
                    document.getElementById('editModuleName').value = this.activeModule.name;
                    document.getElementById('editModuleUrl').value = this.activeModule.url;
                    
                    // Format categories and scores
                    const categoriesScores = this.activeModule.categories
                        .map(category => 
                            `${category}:${Math.round(this.activeModule.scores[category] * 100)}`)
                        .join(', ');
                    document.getElementById('editModuleCategories').value = categoriesScores;
                }
            });

            // Handle click outside to close dropdown
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#editModule') && 
                    !e.target.closest('#editModuleDropdown')) {
                    editDropdown?.classList.remove('show');
                }
            });
        }

        // Add form submission handler
        const editModuleForm = document.getElementById('editModuleForm');
        if (editModuleForm) {
            editModuleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (!this.activeModule) return;
                
                const newUrl = document.getElementById('editModuleUrl').value;
                const newCategories = document.getElementById('editModuleCategories').value;
                
                try {
                    const { categories, scores } = this.parseCategoriesAndScores(newCategories);
                    
                    // Update module
                    this.activeModule.url = newUrl;
                    this.activeModule.categories = categories;
                    this.activeModule.scores = scores;
                    
                    // Update both arrays
                    const moduleIndex = this.modules.findIndex(m => m.name === this.activeModule.name);
                    const defaultIndex = this.defaultModules.findIndex(m => m.name === this.activeModule.name);
                    
                    if (moduleIndex !== -1) this.modules[moduleIndex] = this.activeModule;
                    if (defaultIndex !== -1) this.defaultModules[defaultIndex] = this.activeModule;
                    
                    // Close dropdown and reset form
                    editDropdown.classList.remove('show');
                    editModuleForm.reset();
                    
                    console.log('Module updated successfully');
                } catch (error) {
                    console.error('Error updating module:', error);
                    this.showError(error.message);
                }
            });
        }

        // Add click listener for sidebar auto-close
        document.addEventListener('click', (event) => {
            const sidebar = document.querySelector('.sidebar');
            const sidebarToggle = document.querySelector('.sidebar-toggle');
            if (sidebar.classList.contains('visible') && 
                !sidebar.contains(event.target) && 
                event.target !== sidebarToggle) {
                sidebar.classList.remove('visible');
                if (sidebarToggle) {
                    sidebarToggle.style.transform = 'translateY(-50%) rotate(0deg)';
                }
            }
        });

        // Update touch event handlers
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTouchStart(e);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleTouchMove(e);
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        });

        // Add click/touch listener for sidebar auto-close
        document.addEventListener('touchend', (event) => {
            const sidebar = document.querySelector('.sidebar');
            const sidebarToggle = document.querySelector('.sidebar-toggle');
            
            if (sidebar.classList.contains('visible') && 
                !sidebar.contains(event.target) && 
                event.target !== sidebarToggle) {
                    
                sidebar.classList.remove('visible');
                if (sidebarToggle) {
                    sidebarToggle.style.transform = 'translateY(-50%) rotate(0deg)';
                }
            }
        });
    }

    handleTouchStart(event) {
        event.preventDefault();  // Prevent default touch behavior
        this.lastTouchX = event.touches[0].clientX;
        this.lastTouchY = event.touches[0].clientY;
        this.touchStartX = this.lastTouchX;
        this.touchStartY = this.lastTouchY;
        this.touchStartTime = Date.now();
    }

    handleTouchMove(event) {
        event.preventDefault();
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        const dx = touchX - this.lastTouchX;
        const dy = touchY - this.lastTouchY;

        this.rotationY += dx * 0.005;
        this.rotationX -= dy * 0.005;

        this.lastTouchX = touchX;
        this.lastTouchY = touchY;
    }

    handleTouchEnd(event) {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - this.touchStartTime;
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const totalMovement = Math.abs(touchEndX - this.touchStartX) + 
                            Math.abs(touchEndY - this.touchStartY);

        if (touchDuration < 1000 && totalMovement < 10) {  // Handle taps
            const rect = this.canvas.getBoundingClientRect();
            const x = touchEndX - rect.left;
            const y = touchEndY - rect.top;
            
            const tappedModule = this.getHoveredModule(x, y);
            
            if (tappedModule) {
                if (this.activeModule !== tappedModule) {
                    // Use the existing selection handler that was working
                    this.handleModuleSelection(x, y);
                    this.showTooltip(tappedModule, touchEndX, touchEndY);
                } else if (touchDuration > 800) {
                    if (tappedModule.url) {
                        window.open(tappedModule.url, '_blank');
                    }
                }
            } else {
                this.handleModuleSelection(x, y);  // This will handle deselection
                this.hideTooltip();
            }
        }

        // Always apply momentum for swipes
        const dx = touchEndX - this.touchStartX;
        const dy = touchEndY - this.touchStartY;
        
        const momentumMultiplier = 0.001;
        this.momentumX = dy * momentumMultiplier;
        this.momentumY = dx * momentumMultiplier;
        
        const maxMomentum = 0.02;
        this.momentumX = Math.max(Math.min(this.momentumX, maxMomentum), -maxMomentum);
        this.momentumY = Math.max(Math.min(this.momentumY, maxMomentum), -maxMomentum);
    }

    updateEditButton() {
        const editButton = document.getElementById('editModule');
        if (editButton) {
            if (this.activeModule) {
                editButton.disabled = false;
                editButton.classList.remove('disabled');
                editButton.style.opacity = '1';
            } else {
                editButton.disabled = true;
                editButton.classList.add('disabled');
                editButton.style.opacity = '0.5';
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update rotation with momentum
        this.rotationY += this.momentumX;
        this.rotationX += this.momentumY;

        // Apply friction to momentum
        this.momentumX *= 0.95;
        this.momentumY *= 0.95;

        // Clear canvas and draw modules
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.modules.forEach(module => {
            module.update();
            this.drawModule(module);
        });

        // Update tooltip position if needed
        if (this.activeModule && this.tooltip.style.display !== 'none') {
            this.updateTooltipPosition(this.activeModule);
        }
    }

    handleModuleSelection(x, y) {
        const hoveredModule = this.getHoveredModule(x, y);
        this.handleModuleActivation(hoveredModule, x, y);
    }

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }

    handleMouseMove = (event) => {
        // Only handle cursor style changes
        if (!this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const hoveredModule = this.getHoveredModule(mouseX, mouseY);
            this.canvas.style.cursor = hoveredModule ? 'pointer' : 'grab';
        }
    };

    handleDoubleClick() {
        if (this.hoveredModule) {
            window.open(this.hoveredModule.url, '_blank');
        }
    }

    async showTooltip(module, x, y) {
        if (!this.tooltip) return;
        
        const loadingText = this.currentLanguage === 'he' ? 'טוען...' : 'Loading...';
        
        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <a href="${module.url}" target="_blank" class="tooltip-favicon">
                    <img src="${this.getFaviconUrl(module.url)}" 
                         width="16" height="16" 
                         alt="${module.name} logo" 
                         class="tooltip-logo"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>'">
                </a>
                <a href="${module.url}" target="_blank" class="tooltip-name">
                    <h3 class="module-name">${module.name}</h3>
                </a>
            </div>
            <div class="tooltip-body">
                <p class="description">${loadingText}</p>
                <div class="tooltip-metadata">
                    <p><strong>Categories & Scores:</strong></p>
                    <pre>${module.categories
                        .map(category => {
                            const score = module.scores[category];
                            return ` ${category}: ${score ? Math.round(score * 100) + '%' : 'N/A'}`;
                        })
                        .join('\n')}</pre>
                </div>
            </div>
        `;

        // Position tooltip
        const padding = 10;
        this.tooltip.style.display = 'block';
        this.tooltip.style.left = `${x + padding}px`;
        this.tooltip.style.top = `${y + padding}px`;

        // Immediately try to get and update the description
        this.getModuleDescription(module).then(description => {
            if (this.tooltip.style.display !== 'none') {  // Only update if tooltip is still shown
                const descriptionElement = this.tooltip.querySelector('.description');
                if (descriptionElement) {
                    descriptionElement.innerHTML = description;
                }
            }
        });
    }

    hideTooltip() {
        // Only hide if we're explicitly closing it
        if (this.tooltip && !this.pinnedTooltip) {
            this.tooltip.style.display = 'none';
        }
    }

    updateActiveButtons() {
        document.querySelectorAll('.sidebar button').forEach(button => {
            button.classList.toggle('active', 
                this.selectedCategories.has(button.dataset.category)
            );
        });
    }

    filterModules() {
        this.modules.forEach(module => {
            const score = module.getAverageScore(this.selectedCategories);
            module.visible = score > 0;
            module.scale = 0.5 + (score * 0.5);
            module.opacity = 0.3 + (score * 0.7);
        });
    }

    rotatePoint(x, y, z) {
        // Only rotate if the point exists
        if (x === undefined || y === undefined || z === undefined) {
            return { x: 0, y: 0, z: 0 };
        }

        // Rotate around Y axis
        const cosY = Math.cos(this.rotationY);
        const sinY = Math.sin(this.rotationY);
        const tempX = x * cosY - z * sinY;
        const tempZ = z * cosY + x * sinY;

        // Rotate around X axis
        const cosX = Math.cos(this.rotationX);
        const sinX = Math.sin(this.rotationX);
        const tempY = y * cosX - tempZ * sinX;
        z = tempZ * cosX + y * sinX;

        return { x: tempX, y: tempY, z };
    }

    getHoveredModule(x, y) {
        const isMobile = 'ontouchstart' in window;
        const hitRadius = isMobile ? 50 : 30;
        let closestModule = null;
        let closestDistance = Infinity;
        let closestZ = -Infinity;

        for (const module of this.modules) {
            const rotated = this.rotatePoint(module.x, module.y, module.z);
            const screenX = this.canvas.width / 2 + rotated.x * this.scale;
            const screenY = this.canvas.height / 2 + rotated.y * this.scale;

            const dx = x - screenX;
            const dy = y - screenY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if within hit radius and closer (more in front) than previous matches
            if (distance < hitRadius * this.scale) {
                if (rotated.z > closestZ || 
                   (rotated.z === closestZ && distance < closestDistance)) {
                    closestModule = module;
                    closestDistance = distance;
                    closestZ = rotated.z;
                }
            }
        }
        return closestModule;
    }

    saveModules() {
        // Create file content
        const modulesLines = this.modules.map((module, index) => {
            const categoriesStr = module.categories.map(cat => `"${cat}"`).join(', ');
            const scoresStr = Object.entries(module.scores)
                .map(([cat, score]) => `"${cat}": ${score}`)
                .join(', ');
            
            // Add comma only if it's not the last item
            const comma = index === this.modules.length - 1 ? '' : ',';
            
            return `\t{ name: "${module.name}", categories: [${categoriesStr}], url: "${module.url}", scores: { ${scoresStr} } }${comma}`;
        });

        const fileContent = 'const defaultModules = [\n' + modulesLines.join('\n') + '\n];';
        
        // Prompt for filename
        let filename = prompt('Enter a name for your file:', 'my_modules');
        if (!filename) return; // User cancelled
        
        // Add .js extension if not present
        if (!filename.toLowerCase().endsWith('.js')) {
            filename += '.js';
        }
        
        const blob = new Blob([fileContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    addNewModule(name, url, categoriesString) {
        try {
            const { categories, scores } = this.parseCategoriesAndScores(categoriesString);
            
            // Simple validation - just check if fields are not empty
            if (!name?.trim()) {
                throw new Error('Module name is required');
            }
            if (!url?.trim()) {
                throw new Error('Module URL is required');
            }
            if (categories.length === 0) {
                throw new Error('At least one category is required');
            }

            const module = new AIModule(
                name.trim(),
                categories,
                url.trim(),
                scores
            );

            // Add to arrays
            this.modules.push(module);
            this.defaultModules.push(module);
            this.positionModuleInCloud(module);
            
            console.log('Added module:', {
                name: module.name,
                categories: module.categories,
                scores: module.scores
            });

            return true;
        } catch (error) {
            console.error('Error adding module:', error);
            this.showError(error.message);
            return false;
        }
    }

    parseCategoriesAndScores(categoriesString) {
        const categories = [];
        const scores = {};
        
        if (!categoriesString?.trim()) {
            throw new Error('Categories string is required');
        }

        categoriesString.split(',').forEach((item, index) => {
            const [category, score] = item.trim().split(':');
            
            if (!category) {
                throw new Error(`Invalid format at item ${index + 1}. Expected "Category:Score"`);
            }

            const cleanCategory = category.trim();
            const numScore = score ? parseFloat(score) : 100; // Default to 100 if no score provided

            if (isNaN(numScore) || numScore < 0 || numScore > 100) {
                throw new Error(`Invalid score for ${cleanCategory}: ${score}. Score must be between 0 and 100`);
            }

            categories.push(cleanCategory);
            scores[cleanCategory] = numScore / 100;
        });

        return { categories, scores };
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                // Extract array content between brackets
                const match = content.match(/\[([\s\S]*)\]/);
                if (!match) {
                    throw new Error('Invalid file format');
                }

                // Evaluate the array content
                const modules = eval(`[${match[1]}]`);
                this.initializeFromModules(modules);
                
                console.log('Successfully loaded', this.modules.length, 'modules');
            } catch (error) {
                console.error('Error loading file:', error);
                this.showError('Error loading file. Please check the format.');
            }
        };

        reader.readAsText(file);
    }

    drawModule(module) {
        const rotated = this.rotatePoint(module.x, module.y, module.z);
        
        // Calculate font size based on scores
        const activeCategories = new Set(
            Array.from(document.querySelectorAll('.sidebar button.active'))
                .map(btn => btn.dataset.category)
        );
        
        // Base size calculation with multiplier
        let fontSize = 14 * this.fontSizeMultiplier;
        
        if (activeCategories.size > 0) {
            const score = module.getAverageScore(activeCategories);
            fontSize = (14 + ((score - 0.8) * 110)) * this.fontSizeMultiplier;
        }
        
        const centerX = this.canvas.width / (2 * window.devicePixelRatio);
        const centerY = this.canvas.height / (2 * window.devicePixelRatio);
        
        this.ctx.save();
        this.ctx.translate(
            centerX + (rotated.x * this.scale),
            centerY + (rotated.y * this.scale)
        );
        
        // Set opacity based on whether module is active
        if (this.activeModule && this.activeModule !== module) {
            this.ctx.globalAlpha = document.body.classList.contains('light-mode') ? 0.2 : 0.3;
        } else {
            this.ctx.globalAlpha = 1;
        }
        
        this.ctx.fillStyle = document.body.classList.contains('light-mode') ? '#000000' : '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.font = `${fontSize}px Heebo`;
        this.ctx.fillText(module.name, 0, 0);
        
        this.ctx.restore();
    }

    getHoveredModule(mouseX, mouseY) {
        const hoveredModule = this.modules.find(module => {
            const rotated = this.rotatePoint(module.x, module.y, module.z);
            const screenX = (this.canvas.width / 2 / window.devicePixelRatio) + (rotated.x * this.scale);
            const screenY = (this.canvas.height / 2 / window.devicePixelRatio) + (rotated.y * this.scale);
            
            // Reduce hit area for more precise detection
            const hitRadius = 15; // Reduced from 25 to 15 for more precise clicks
            const dx = mouseX - screenX;
            const dy = mouseY - screenY;
            
            return (dx * dx + dy * dy) < (hitRadius * hitRadius);
        });
        
        return hoveredModule;
    }

    setupTouchEvents() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            const touchedModule = this.getHoveredModule(touchX, touchY);
            this.handleModuleActivation(touchedModule, touch.clientX, touch.clientY);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && this.isDragging) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;

                const deltaX = touchX - this.lastMouseX;
                const deltaY = touchY - this.lastMouseY;
                
                this.momentumX = deltaY * 0.0015;
                this.momentumY = deltaX * 0.0015;
                
                this.rotationX += this.momentumX;
                this.rotationY += this.momentumY;

                this.lastMouseX = touchX;
                this.lastMouseY = touchY;
            } else if (e.touches.length === 2) {
                // Handle pinch-to-zoom
                const currentDistance = this.getTouchDistance(e.touches);
                const delta = currentDistance - this.lastTouchDistance;
                
                this.scale *= (1 + delta * 0.01);
                this.scale = Math.max(0.5, Math.min(2, this.scale));
                
                this.lastTouchDistance = currentDistance;
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                this.isDragging = false;
                this.lastInteractionTime = Date.now();
            }
        });
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    deleteModule(moduleName) {
        const initialLength = this.modules.length;
        
        // Remove from both arrays
        this.modules = this.modules.filter(m => m.name !== moduleName);
        this.defaultModules = this.defaultModules.filter(m => m.name !== moduleName);
        
        if (this.modules.length < initialLength) {
            console.log(`Deleted module: ${moduleName}`);
        } else {
            this.showError(`Module "${moduleName}" not found`);
        }
    }

    updateTooltipPosition(module) {
        if (!this.tooltip || !module) return;
        
        const rotated = this.rotatePoint(module.x, module.y, module.z);
        const screenX = (this.canvas.width / 2 / window.devicePixelRatio) + (rotated.x * this.scale);
        const screenY = (this.canvas.height / 2 / window.devicePixelRatio) + (rotated.y * this.scale);
        
        // Convert canvas coordinates to screen coordinates
        const rect = this.canvas.getBoundingClientRect();
        const worldX = rect.left + screenX;
        const worldY = rect.top + screenY;

        // Check if we're on mobile
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        if (isMobile) {
            // Center the tooltip horizontally and position it below the module
            const tooltipWidth = this.tooltip.offsetWidth;
            const leftPosition = Math.max(10, Math.min(
                window.innerWidth - tooltipWidth - 10,
                worldX - (tooltipWidth / 2)
            ));
            
            this.tooltip.style.left = `${leftPosition}px`;
            this.tooltip.style.top = `${worldY + 30}px`; // Position below module
        } else {
            // Desktop positioning
            this.tooltip.style.left = `${worldX + 20}px`;
            this.tooltip.style.top = `${worldY - 10}px`;
        }
    }

    async getModuleDescription(module) {
        try {
            // Return cached description if available
            if (this.descriptionCache.has(module.name + this.currentLanguage)) {
                return this.descriptionCache.get(module.name + this.currentLanguage);
            }

            const proxyUrl = `https://api.microlink.io?url=${encodeURIComponent(module.url)}`;
            const metaResponse = await fetch(proxyUrl);
            const metadata = await metaResponse.json();

            let description = metadata.data?.description || 
                             metadata.data?.meta?.description;

            if (!description) {
                return this.getDefaultDescription(module);
            }

            // Translate description if in Hebrew mode
            if (this.currentLanguage === 'he') {
                try {
                    const translateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=he&dt=t&q=${encodeURIComponent(description)}`;
                    const translateResponse = await fetch(translateUrl);
                    const translateData = await translateResponse.json();
                    description = translateData[0][0][0];
                } catch (error) {
                    console.log('Translation error:', error);
                    // Fall back to English if translation fails
                }
            }

            // Limit description length
            if (description.length > 150) {
                description = description.substring(0, 147) + '...';
            }

            // Cache the result with language key
            this.descriptionCache.set(module.name + this.currentLanguage, description);
            
            return description;
        } catch (error) {
            console.log('Error fetching description:', error);
            return this.getDefaultDescription(module);
        }
    }

    getDefaultDescription(module) {
        const defaults = {
            en: `${module.name} - AI-powered tool`,
            he: `${module.name} - כלי מבוסס בינה מלאכותית`
        };
        return defaults[this.currentLanguage || 'en'];
    }

    updateTooltipPosition(x, y) {
        if (this.tooltip && this.tooltip.style.display === 'block') {
            this.tooltip.style.left = `${x + 10}px`;
            this.tooltip.style.top = `${y + 10}px`;
        }
    }

    setupSidebarToggle() {
        const toggleButton = document.createElement('button');
        toggleButton.innerHTML = '›';
        toggleButton.className = 'sidebar-toggle';
        
        // Create container and restructure elements
        const sidebarContainer = document.createElement('div');
        sidebarContainer.className = 'sidebar-container';
        
        // Get existing sidebar
        const sidebar = document.querySelector('.sidebar');
        
        // Remove sidebar from its current position
        sidebar.parentNode.removeChild(sidebar);
        
        // Add sidebar and toggle button to container
        sidebarContainer.appendChild(sidebar);
        sidebarContainer.appendChild(toggleButton);
        
        // Add container to body
        document.body.appendChild(sidebarContainer);

        this.isSidebarVisible = false;

        toggleButton.addEventListener('click', () => {
            this.isSidebarVisible = !this.isSidebarVisible;
            
            if (this.isSidebarVisible) {
                sidebarContainer.classList.add('visible');
                toggleButton.style.transform = 'translateY(-50%) rotate(180deg)';
            } else {
                sidebarContainer.classList.remove('visible');
                toggleButton.style.transform = 'translateY(-50%) rotate(0deg)';
            }
        });

        // Add click listener for sidebar auto-close
        document.addEventListener('click', (event) => {
            if (this.isSidebarVisible && 
                !sidebarContainer.contains(event.target) && 
                event.target !== toggleButton) {
                this.isSidebarVisible = false;
                sidebarContainer.classList.remove('visible');
                toggleButton.style.transform = 'translateY(-50%) rotate(0deg)';
            }
        });
    }

    getFaviconUrl(url) {
        try {
            if (!url) return 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>';
            return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
        } catch (error) {
            return 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>';
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    handleMouseMove = this.debounce((event) => {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const hoveredModule = this.findModuleAtPosition(x, y);
        
        if (hoveredModule) {
            this.canvas.style.cursor = 'pointer';
            
            // Only update if hovering over a different module
            if (this.lastHoveredModule?.name !== hoveredModule.name) {
                this.lastHoveredModule = hoveredModule;
                clearTimeout(this.descriptionTimeout);
                
                // Wait a bit before showing tooltip to prevent unnecessary API calls
                this.descriptionTimeout = setTimeout(() => {
                    this.showTooltip(hoveredModule, event.clientX, event.clientY);
                }, 500); // Half second delay
            }
        } else {
            this.canvas.style.cursor = 'grab';
            this.hideTooltip();
            this.lastHoveredModule = null;
        }
    }, 100); // Debounce mousemove events

    findModuleAtPosition(mouseX, mouseY) {
        // Convert screen coordinates to relative canvas coordinates
        const rect = this.canvas.getBoundingClientRect();
        const x = (mouseX - rect.left) * (this.canvas.width / rect.width);
        const y = (mouseY - rect.top) * (this.canvas.height / rect.height);

        // Check each module
        for (const module of this.modules) {
            // Get the module's screen position
            const rotated = this.rotatePoint(module.x, module.y, module.z);
            const screenX = this.canvas.width / 2 + rotated.x * this.scale;
            const screenY = this.canvas.height / 2 + rotated.y * this.scale;

            // Calculate distance from mouse to module center
            const dx = x - screenX;
            const dy = y - screenY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if mouse is within module's clickable area
            // Adjust this value to change how close you need to be to trigger hover
            const hitRadius = 30 * this.scale;
            
            if (distance < hitRadius) {
                return module;
            }
        }
        return null;
    }

    setupTextControls() {
        const controls = document.createElement('div');
        controls.className = 'text-size-controls';
        controls.innerHTML = `
            <button id="textIncrease" title="Increase Text Size">T+</button>
            <button id="textDecrease" title="Decrease Text Size">T-</button>
        `;

        // Add to controls container instead of body
        const controlsContainer = document.querySelector('.controls');
        controlsContainer.insertBefore(controls, controlsContainer.firstChild);

        document.getElementById('textIncrease').onclick = () => {
            this.fontSizeMultiplier = Math.min(2, this.fontSizeMultiplier + 0.1);
        };

        document.getElementById('textDecrease').onclick = () => {
            this.fontSizeMultiplier = Math.max(0.5, this.fontSizeMultiplier - 0.1);
        };
    }

    setupLanguageToggle() {
        const langButton = document.createElement('button');
        langButton.className = 'control-button language-toggle';
        langButton.textContent = 'ע';
        langButton.title = 'Switch to Hebrew';
        
        const controls = document.querySelector('.controls');
        controls.appendChild(langButton);

        langButton.onclick = () => {
            this.currentLanguage = this.currentLanguage === 'en' ? 'he' : 'en';
            document.documentElement.setAttribute('lang', this.currentLanguage);
            
            // Don't toggle RTL class on the entire body
            // Only apply RTL to specific text elements that need it
            document.querySelectorAll('.needs-rtl').forEach(el => {
                el.dir = this.currentLanguage === 'he' ? 'rtl' : 'ltr';
            });
            
            this.updateLanguage();
            this.updateCategoryLabels();
            
            langButton.textContent = this.currentLanguage === 'en' ? 'ע' : 'A';
            langButton.title = this.currentLanguage === 'en' ? 
                'Switch to Hebrew' : 'Switch to English';
        };
    }

    setupDarkModeToggle() {
        const darkModeButton = document.getElementById('toggleMode');
        console.log('Toggle button:', darkModeButton); // Debugging line

        if (!darkModeButton) {
            console.error('Toggle mode button not found!');
            return; // Exit if the button is not found
        }

        darkModeButton.onclick = () => {
            console.log('Toggle button clicked'); // Debugging line
            document.body.classList.toggle('light-mode'); // Toggle light mode class
            const isLightMode = document.body.classList.contains('light-mode');
            document.body.style.backgroundColor = isLightMode ? '#ffffff' : '#1a1a1a'; // Change background color
            document.querySelector('#moduleCloud').style.backgroundColor = isLightMode ? '#ffffff' : '#1a1a1a'; // Change module cloud background
        };
    }

    updateLanguage() {
        // Update all elements with data-translate attribute
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.dataset.translate;
            if (this.translations[this.currentLanguage][key]) {
                element.innerHTML = this.translations[this.currentLanguage][key];
            }
        });
        
        // Update category buttons
        this.updateCategoryLabels();
    }

    updateCategoryLabels() {
        const buttons = document.querySelectorAll('.sidebar button');
        buttons.forEach(button => {
            const category = button.dataset.category;
            const translation = this.categoryTranslations[this.currentLanguage][category];
            if (translation) {
                button.innerHTML = translation;
            }
        });
    }

    // Add this method to handle tooltip link clicks
    handleTooltipClick(event) {
        if (!this.canOpenUrl) {
            event.preventDefault();
            return false;
        }
    }

    // New helper method to handle all module selection logic
    handleModuleActivation(module, x, y) {
        const editButton = document.getElementById('editModule');
        
        if (module) {
            if (this.activeModule === module) {
                // Second interaction - open URL
                if (module.url) {
                    window.open(module.url, '_blank');
                }
            } else {
                // First interaction - select module
                this.activeModule = module;
                editButton.disabled = false;
                editButton.style.opacity = '1';
                this.showTooltip(module, x, y);
            }
        } else {
            // No module - deselect
            this.activeModule = null;
            this.hideTooltip();
            editButton.disabled = true;
            editButton.style.opacity = '0.5';
        }
    }

    // Add this method to the ModuleCloud class if it's missing
    initializeFromModules(modules) {
        try {
            this.modules = modules.map(m => {
                const module = new AIModule(m.name, m.categories, m.url, m.scores);
                this.positionModuleInCloud(module);
                return module;
            });
            this.defaultModules = [...this.modules];
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing modules:', error);
            this.showError('Error loading modules');
        }
    }
}

// Initialize Supabase client
const supabaseUrl = 'https://your-supabase-url.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'your-anon-key'; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
    // Set default to light mode
    document.body.classList.add('light-mode');
    document.body.style.backgroundColor = '#ffffff';

    // Remove the automatic display of the modal
    // Check if the user is authenticated
    checkAuthenticationStatus().then(isAuthenticated => {
        if (!isAuthenticated) {
            // Do not show the modal here
            // document.getElementById('authModal').style.display = 'block'; // Remove this line
        } else {
            // Load the module cloud if authenticated
            loadModuleCloud();
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
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('authModal').style.display = 'none';
    });

    // Setup dark mode toggle
    setupDarkModeToggle();
});

async function checkAuthenticationStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
}

async function signUp() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (email && password) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
            alert('Error signing up: ' + error.message);
        } else {
            alert('Registration successful! Please check your email to confirm your account.');
        }
    } else {
        alert('Please enter both email and password.');
    }
}

async function signIn() {
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;

    if (email && password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert('Error logging in: ' + error.message);
        } else {
            document.getElementById('authModal').style.display = 'none';
            loadModuleCloud();
        }
    } else {
        alert('Please enter both email and password.');
    }
}

function loadModuleCloud() {
    // Initialize the module cloud
    window.moduleCloud = new ModuleCloud();
}
