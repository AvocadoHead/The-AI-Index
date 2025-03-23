// Database connection and module management for AI Module Cloud
// This file handles Supabase integration, user authentication, and module loading

// Initialize Supabase client
const supabaseUrl = 'https://avdasdlhnfuwrzfpsyis.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGFzZGxobmZ1d3J6ZnBzeWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNzAzOTksImV4cCI6MjA1Nzk0NjM5OX0.VLFFdFEm57eEIj8D0KF10tk3aWpv4effMw0IDNGQA2I';
window.supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Global state for user and modules
window.appState = {
    user: null,
    isPremium: false,
    isAuthenticated: false,
    modules: [],
    premiumModules: []
};

// Database module class
class DatabaseModule {
    constructor() {
        this.initialized = false;
        this.premiumModulesLoaded = false;
    }

    // Initialize database connection and check authentication
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('Initializing database connection...');
            
            // Check if user is already authenticated
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Error checking session:', error.message);
                return;
            }
            
            if (session) {
                await this.handleAuthSuccess(session);
            } else {
                console.log('No active session found');
                // Load default modules for non-authenticated users
                await this.loadDefaultModules();
            }
            
            this.initialized = true;
        } catch (err) {
            console.error('Error initializing database:', err);
            // Fallback to default modules
            await this.loadDefaultModules();
        }
    }

    // Handle successful authentication
    async handleAuthSuccess(session) {
        try {
            const { user } = session;
            window.appState.user = user;
            window.appState.isAuthenticated = true;
            
            console.log('User authenticated:', user.email);
            
            // Update UI to show logged in state
            this.updateLoginButton(user.email);
            
            // Check premium status
            await this.checkPremiumStatus(user.id);
            
            // Load modules based on premium status
            if (window.appState.isPremium) {
                await this.loadAllModules();
            } else {
                await this.loadDefaultModules();
            }
        } catch (err) {
            console.error('Error handling authentication:', err);
            // Fallback to default modules
            await this.loadDefaultModules();
        }
    }

    // Check if user has premium status
    async checkPremiumStatus(userId) {
        try {
            // First check user metadata
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
                console.error('Error getting user:', userError.message);
                return false;
            }
            
            // Special case for admin user
            if (user && user.email === 'eyalizenman@gmail.com') {
                console.log('Admin user detected, granting premium status');
                window.appState.isPremium = true;
                
                // Update user metadata if needed
                await supabase.auth.updateUser({
                    data: { is_premium: true }
                });
                
                this.updatePremiumUI(true);
                return true;
            }
            
            // Check user metadata
            if (user && user.user_metadata && user.user_metadata.is_premium === true) {
                console.log('User is premium according to user metadata');
                window.appState.isPremium = true;
                this.updatePremiumUI(true);
                return true;
            }
            
            // Check users table in database
            const { data, error } = await supabase
                .from('users')
                .select('is_premium')
                .eq('id', userId);
            
            if (error) {
                console.error('Error checking premium status from database:', error.message);
                return false;
            }
            
            if (data && data.length > 0 && data[0].is_premium === true) {
                console.log('User premium status from database check: true');
                window.appState.isPremium = true;
                
                // Update user metadata for faster checks in the future
                await supabase.auth.updateUser({
                    data: { is_premium: true }
                });
                
                this.updatePremiumUI(true);
                return true;
            }
            
            console.log('User is not premium');
            window.appState.isPremium = false;
            this.updatePremiumUI(false);
            return false;
        } catch (err) {
            console.error('Error checking premium status:', err);
            return false;
        }
    }

    // Update UI to reflect premium status
    updatePremiumUI(isPremium) {
        const loginButton = document.getElementById('loginButton');
        if (!loginButton) return;
        
        if (isPremium) {
            loginButton.innerHTML = '<i class="fas fa-crown"></i> Premium';
            loginButton.classList.add('premium-user');
        } else {
            loginButton.classList.remove('premium-user');
        }
    }

    // Update login button to show user email or login status
    updateLoginButton(email) {
        const loginButton = document.getElementById('loginButton');
        if (!loginButton) return;
        
        if (window.appState.isPremium) {
            loginButton.innerHTML = '<i class="fas fa-crown"></i> Premium';
            loginButton.classList.add('premium-user');
        } else if (email) {
            loginButton.textContent = email;
        } else {
            loginButton.textContent = 'Login';
            loginButton.classList.remove('premium-user');
        }
    }

    // Load default modules from modules.js
    async loadDefaultModules() {
        try {
            if (typeof window.defaultModules !== 'undefined' && Array.isArray(window.defaultModules)) {
                console.log('Found modules file, attempting to load...');
                console.log('Total modules in file:', window.defaultModules.length);
                
                // Convert to AIModule instances
                const modules = window.defaultModules.map(module => {
                    const scores = {};
                    if (module.scores) {
                        Object.keys(module.scores).forEach(category => {
                            scores[category] = module.scores[category] * 100; // Convert to 0-100 scale
                        });
                    }
                    
                    return new AIModule(
                        module.name,
                        Array.isArray(module.categories) ? module.categories.join(', ') : module.categories,
                        module.url,
                        scores
                    );
                });
                
                window.appState.modules = modules;
                
                // Update ModuleCloud if it exists
                if (window.moduleCloud) {
                    window.moduleCloud.modules = modules;
                    window.moduleCloud.positionModules();
                }
                
                console.log('Successfully loaded', modules.length, 'modules');
            } else {
                console.error('Default modules not found or not in expected format');
            }
        } catch (err) {
            console.error('Error loading default modules:', err);
        }
    }

    // Load all modules (default + premium)
    async loadAllModules() {
        try {
            // First load default modules
            await this.loadDefaultModules();
            
            // Then load premium modules from database
            await this.loadPremiumModules();
            
            // Combine modules
            if (window.appState.premiumModules.length > 0) {
                window.appState.modules = [...window.appState.modules, ...window.appState.premiumModules];
                
                // Update ModuleCloud if it exists
                if (window.moduleCloud) {
                    window.moduleCloud.modules = window.appState.modules;
                    window.moduleCloud.positionModules();
                }
                
                console.log('Successfully loaded', window.appState.modules.length, 'modules');
            }
        } catch (err) {
            console.error('Error loading all modules:', err);
        }
    }

    // Load premium modules from database
    async loadPremiumModules() {
        if (this.premiumModulesLoaded) return;
        
        try {
            // Try to load from database first
            const { data, error } = await supabase
                .from('modules')
                .select('*')
                .eq('is_premium', true);
            
            if (error) {
                console.error('Error loading premium modules from database:', error.message);
                // Fallback to premium_tier_modules.js if available
                await this.loadPremiumModulesFromFile();
                return;
            }
            
            if (data && data.length > 0) {
                console.log('Loaded', data.length, 'premium modules from database');
                
                // Convert to AIModule instances
                const premiumModules = data.map(module => {
                    const scores = module.scores || {};
                    
                    return new AIModule(
                        module.name,
                        module.categories,
                        module.url,
                        scores
                    );
                });
                
                window.appState.premiumModules = premiumModules;
                this.premiumModulesLoaded = true;
                
                console.log('Successfully loaded', premiumModules.length, 'premium modules from database');
            } else {
                console.log('No premium modules found in database, trying fallback');
                // Fallback to premium_tier_modules.js if available
                await this.loadPremiumModulesFromFile();
            }
        } catch (err) {
            console.error('Error loading premium modules:', err);
            // Fallback to premium_tier_modules.js if available
            await this.loadPremiumModulesFromFile();
        }
    }

    // Load premium modules from file (fallback)
    async loadPremiumModulesFromFile() {
        try {
            // Check if premium modules are defined in window
            if (typeof window.premiumModules !== 'undefined' && Array.isArray(window.premiumModules)) {
                console.log('Found premium modules file, attempting to load...');
                
                // Convert to AIModule instances
                const premiumModules = window.premiumModules.map(module => {
                    const scores = {};
                    if (module.scores) {
                        Object.keys(module.scores).forEach(category => {
                            scores[category] = module.scores[category] * 100; // Convert to 0-100 scale
                        });
                    }
                    
                    return new AIModule(
                        module.name,
                        Array.isArray(module.categories) ? module.categories.join(', ') : module.categories,
                        module.url,
                        scores
                    );
                });
                
                window.appState.premiumModules = premiumModules;
                this.premiumModulesLoaded = true;
                
                console.log('Successfully loaded', premiumModules.length, 'premium modules from file');
            } else {
                console.error('Premium modules not found or not in expected format');
                
                // Create some sample premium modules as a last resort
                const samplePremiumModules = [
                    new AIModule("Claude 3 Opus", "LLM, USE", "https://claude.ai/", { "LLM": 98, "USE": 95 }),
                    new AIModule("GPT-4o", "LLM, USE", "https://chat.openai.com/", { "LLM": 97, "USE": 96 }),
                    new AIModule("Midjourney V6", "T2I", "https://www.midjourney.com/", { "T2I": 98 }),
                    new AIModule("DALL-E 3", "T2I", "https://openai.com/dall-e-3", { "T2I": 95 }),
                    new AIModule("Runway Gen-3", "T2V, I2V", "https://runwayml.com/", { "T2V": 96, "I2V": 95 }),
                    new AIModule("Pika Labs", "T2V, I2V", "https://pika.art/", { "T2V": 94, "I2V": 93 }),
                    new AIModule("Stable Diffusion 3", "T2I, I2I", "https://stability.ai/", { "T2I": 93, "I2I": 92 }),
                    new AIModule("Anthropic Claude API", "LLM, DEV", "https://www.anthropic.com/api", { "LLM": 96, "DEV": 94 }),
                    new AIModule("OpenAI API", "LLM, DEV", "https://platform.openai.com/", { "LLM": 95, "DEV": 95 }),
                    new AIModule("ElevenLabs", "T2S, VCL", "https://elevenlabs.io/", { "T2S": 97, "VCL": 98 })
                ];
                
                window.appState.premiumModules = samplePremiumModules;
                this.premiumModulesLoaded = true;
                
                console.log('Created', samplePremiumModules.length, 'sample premium modules as fallback');
            }
        } catch (err) {
            console.error('Error loading premium modules from file:', err);
        }
    }

    // Sign in user
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                console.error('Error signing in:', error.message);
                return { success: false, message: error.message };
            }
            
            await this.handleAuthSuccess(data.session);
            return { success: true };
        } catch (err) {
            console.error('Exception during sign in:', err);
            return { success: false, message: 'An unexpected error occurred' };
        }
    }

    // Sign up user
    async signUp(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            
            if (error) {
                console.error('Error signing up:', error.message);
                return { success: false, message: error.message };
            }
            
            return { 
                success: true, 
                message: 'Sign up successful! Please check your email to confirm your account.' 
            };
        } catch (err) {
            console.error('Exception during sign up:', err);
            return { success: false, message: 'An unexpected error occurred' };
        }
    }

    // Sign out user
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Error signing out:', error.message);
                return { success: false, message: error.message };
            }
            
            // Reset state
            window.appState.user = null;
            window.appState.isPremium = false;
            window.appState.isAuthenticated = false;
            
            // Update UI
            this.updateLoginButton(null);
            
            // Load only default modules
            await this.loadDefaultModules();
            
            return { success: true };
        } catch (err) {
            console.error('Exception during sign out:', err);
            return { success: false, message: 'An unexpected error occurred' };
        }
    }

    // Request premium access
    async requestPremiumAccess() {
        if (!window.appState.isAuthenticated) {
            return { success: false, message: 'Please sign in first' };
        }
        
        try {
            // Record premium request in database
            const { error } = await supabase
                .from('premium_requests')
                .insert([
                    { 
                        user_id: window.appState.user.id,
                        email: window.appState.user.email,
                        status: 'pending'
                    }
                ]);
            
            if (error) {
                console.error('Error recording premium request:', error.message);
                return { success: false, message: error.message };
            }
            
            return { success: true, message: 'Premium request submitted successfully' };
        } catch (err) {
            console.error('Exception during premium request:', err);
            return { success: false, message: 'An unexpected error occurred' };
        }
    }
}

// Initialize database module
window.databaseModule = new DatabaseModule();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for ModuleCloud to initialize
    const checkModuleCloud = setInterval(() => {
        if (window.moduleCloud) {
            clearInterval(checkModuleCloud);
            
            // Initialize database module
            window.databaseModule.initialize();
        }
    }, 100);
});
