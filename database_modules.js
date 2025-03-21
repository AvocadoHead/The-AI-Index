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
    if (typeof window.premiumTierModules !== 'undefined') {
        return window.premiumTierModules.some(module => module.id === moduleId);
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
        // Check if modules is defined before using it
        if (typeof window.modules !== 'undefined') {
            return window.modules;
        } else {
            console.error('Local modules not found');
            return [];
        }
    }
};

// Initialize modules when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit to ensure other scripts have loaded
    setTimeout(async () => {
        try {
            const loadedModules = await loadModulesWithFallback();
            if (loadedModules && loadedModules.length > 0) {
                // Use the loaded modules to populate the UI
                console.log(`Loaded ${loadedModules.length} modules`);
                // Make modules available to other scripts
                window.databaseModules = loadedModules;
            } else {
                console.warn('No modules were loaded');
            }
        } catch (err) {
            console.error('Error loading modules:', err);
        }
    }, 500);
});

// Expose module loading functionality to window
window.moduleDatabase = {
    fetchModules: loadModulesWithFallback,
    isPremium: isPremiumModule
}; 