// Database connection to Supabase
const supabaseUrl = 'https://avdasdlhnfuwrzfpsyis.supabase.co';
// Use the anon key from the window object to avoid duplication
const supabaseKey = window.supabaseKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGFzZGxobmZ1d3J6ZnBzeWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNzAzOTksImV4cCI6MjA1Nzk0NjM5OX0.VLFFdFEm57eEIj8D0KF10tk3aWpv4effMw0IDNGQA2I';

// Initialize the Supabase client
const initSupabase = ()  => {
    try {
        // Use the already initialized supabase client from the window object
        if (window.supabase) {
            return window.supabase;
        } else {
            console.warn('Supabase not found on window object');
            return null;
        }
    } catch (error) {
        console.error('Error initializing Supabase client:', error);
        return null;
    }
};

// Function to check premium status directly from database
const checkPremiumStatusFromDB = async (userId) => {
    if (!userId) {
        console.log('No user ID provided for premium check');
        return false;
    }
    
    const supabaseClient = initSupabase();
    if (!supabaseClient) {
        console.error('Failed to initialize Supabase client for premium check');
        return false;
    }
    
    try {
        // First check the users table
        const { data, error } = await supabaseClient
            .from('users')
            .select('is_premium')
            .eq('id', userId)
            .single();
            
        if (error) {
            console.error('Error fetching premium status from users table:', error);
            return false;
        }
        
        if (data && data.is_premium === true) {
            console.log('User is premium according to users table');
            
            // Update user metadata if needed
            try {
                const { error: updateError } = await supabaseClient.auth.updateUser({
                    data: { is_premium: true }
                });
                
                if (updateError) {
                    console.error('Error updating user premium metadata:', updateError);
                } else {
                    console.log('Updated user metadata with premium status');
                }
            } catch (updateErr) {
                console.error('Exception updating user metadata:', updateErr);
            }
            
            return true;
        }
        
        console.log('User is not premium according to users table or user not found');
        return false;
    } catch (error) {
        console.error('Exception checking premium status from database:', error);
        return false;
    }
};

// Function to fetch modules from Supabase
const fetchModulesFromDatabase = async () => {
    try {
        const supabaseClient = initSupabase();
        
        if (!supabaseClient) {
            console.warn('Supabase client not initialized, using fallback modules');
            return null;
        }
        
        const { data, error } = await supabaseClient
            .from('modules')
            .select('*');
            
        if (error) {
            console.error('Error fetching modules from Supabase:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Exception when fetching modules from database:', error);
        return null;
    }
};

// Function to determine if a module is premium
const isPremiumModule = (moduleId) => {
    // Check if the module is in the premium tier list
    if (typeof window.premiumModules !== 'undefined') {
        return window.premiumModules.some(module => module.id === moduleId);
    }
    return false;
};

// Function to load modules with fallback to local data
const loadModulesWithFallback = async () => {
    // Try to fetch from database first
    const databaseModules = await fetchModulesFromDatabase();
    
    if (databaseModules && databaseModules.length > 0) {
        console.log('Using modules from database');
        return databaseModules;
    } else {
        console.log('Using fallback modules from local file');
        // Check if defaultModules is defined in the window object
        if (typeof window.defaultModules !== 'undefined') {
            console.log('Using defaultModules from modules.js as fallback');
            return window.defaultModules;
        } else {
            console.error('Local defaultModules not found in modules.js');
            // Set a global variable to indicate we need to retry
            window.needModulesRetry = true;
            return [];
        }
    }
};

// Set user premium status
const setUserPremiumStatus = async () => {
    try {
        const supabaseClient = initSupabase();
        if (!supabaseClient) return false;
        
        // Get current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !user) {
            console.error('Error getting current user:', userError);
            return false;
        }
        
        // Check premium status from database
        const isPremium = await checkPremiumStatusFromDB(user.id);
        
        // Set user tier in ModuleCloud
        if (window.moduleCloud) {
            window.moduleCloud.userTier = isPremium ? 'premium' : 'free';
            console.log(`Set moduleCloud user tier to ${window.moduleCloud.userTier}`);
        }
        
        // Update UI based on premium status
        if (isPremium) {
            const loginButton = document.getElementById('loginButton');
            if (loginButton) {
                loginButton.innerHTML = '⭐ Premium';
                loginButton.classList.add('premium-user');
            }
        }
        
        return isPremium;
    } catch (error) {
        console.error('Error setting user premium status:', error);
        return false;
    }
};

// Initialize modules when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit to ensure other scripts have loaded
    setTimeout(async () => {
        try {
            // Check and set premium status first
            await setUserPremiumStatus();
            
            // Force the moduleCloud to initialize with default modules
            if (typeof window.defaultModules !== 'undefined') {
                console.log('Default modules found:', window.defaultModules.length);
                if (!window.moduleCloud) {
                    console.log('Creating ModuleCloud instance');
                    window.moduleCloud = new ModuleCloud();
                } else {
                    console.log('ModuleCloud instance already exists');
                }
                
                // Make sure modules are loaded and visible
                if (window.moduleCloud.modules.length === 0) {
                    console.log('Loading modules into ModuleCloud');
                    window.moduleCloud.loadModules();
                    window.moduleCloud.positionModules();
                    console.log(`Loaded ${window.moduleCloud.modules.length} modules`);
                }
            } else {
                console.warn('Default modules not found in window object. Make sure modules.js is loaded properly.');
            }
        } catch (err) {
            console.error('Error during module initialization:', err);
        }
    }, 1000); // Increase timeout to ensure scripts are loaded
});

// Expose module loading functionality to window
window.moduleDatabase = {
    fetchModules: loadModulesWithFallback,
    isPremium: isPremiumModule,
    checkPremiumStatus: checkPremiumStatusFromDB,
    setUserPremiumStatus: setUserPremiumStatus
}; 