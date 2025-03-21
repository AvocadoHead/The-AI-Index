// Database connection to Supabase
const supabaseUrl = 'https://avdasdlhnfuwrzfpsyis.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZGFzZGxobmZ1d3J6ZnBzeWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjM3MDM5OSwiZXhwIjoyMDU3OTQ2Mzk5fQ.YdL8OLjo0rQzdeL7GN9A9VPTgHbvV4FsaTwOlqY_PWI';

// Initialize the Supabase client
const initSupabase = ()  => {
    try {
        return supabase.createClient(supabaseUrl, supabaseKey);
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
    return premiumTierModules.some(module => module.id === moduleId);
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
        return modules; // Fallback to local modules.js
    }
};

// Initialize modules when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    const loadedModules = await loadModulesWithFallback();
    if (loadedModules) {
        // Use the loaded modules to populate the UI
        console.log(`Loaded ${loadedModules.length} modules`);
    }
}); 