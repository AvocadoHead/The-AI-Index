// Fix script for sidebar toggle and module loading
console.log('Running fix-sidebar.js');

// Function to ensure the sidebar toggle works
function fixSidebarToggle() {
    const sidebarContainer = document.querySelector('.sidebar-container');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    
    if (!sidebarContainer || !sidebarToggle) {
        console.error('Sidebar elements not found');
        return;
    }
    
    // Make sure the sidebar is in the correct initial state
    if (!sidebarContainer.classList.contains('collapsed')) {
        sidebarContainer.classList.add('collapsed');
        console.log('Forced sidebar to collapsed state');
    }
    
    // Remove any existing click handlers and add a new one
    sidebarToggle.removeEventListener('click', toggleSidebar);
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    console.log('Sidebar toggle fixed');
    
    // Toggle function
    function toggleSidebar() {
        sidebarContainer.classList.toggle('collapsed');
        console.log('Sidebar toggled:', sidebarContainer.classList.contains('collapsed') ? 'collapsed' : 'expanded');
    }
}

// Function to ensure modules are loaded
function fixModuleLoading() {
    console.log('Checking module loading');
    
    // Check if we have a module cloud instance
    if (!window.moduleCloudInstance && window.ModuleCloud) {
        console.log('Creating new ModuleCloud instance');
        window.moduleCloudInstance = new window.ModuleCloud();
    }
    
    // Check if we have modules
    if (window.moduleCloudInstance && window.moduleCloudInstance.modules && window.moduleCloudInstance.modules.length === 0) {
        console.log('No modules found, trying to load default modules');
        
        if (window.defaultModules && Array.isArray(window.defaultModules)) {
            console.log(`Loading ${window.defaultModules.length} modules from defaultModules`);
            
            // Create module objects
            const modules = window.defaultModules.map(data => 
                new window.AIModule(
                    data.name, 
                    data.categories, 
                    data.url, 
                    data.scores,
                    data.is_premium || false
                )
            );
            
            // Set modules and position them
            window.moduleCloudInstance.modules = modules;
            window.moduleCloudInstance.positionModules();
            
            console.log('Modules loaded successfully');
        } else {
            console.error('defaultModules not found or not an array');
        }
    }
}

// Function to fix load index button
function fixLoadIndexButton() {
    const loadIndexBtn = document.getElementById('loadIndex');
    const fileInput = document.getElementById('fileInput');
    
    if (!loadIndexBtn || !fileInput) {
        console.error('Load index button or file input not found');
        return;
    }
    
    // Remove existing event listeners (to avoid duplicates)
    loadIndexBtn.removeEventListener('click', handleLoadIndex);
    loadIndexBtn.addEventListener('click', handleLoadIndex);
    
    // Remove existing file input listeners
    const newFileInput = fileInput.cloneNode(true);
    fileInput.parentNode.replaceChild(newFileInput, fileInput);
    
    // Add new file input listener
    newFileInput.addEventListener('change', handleFileChange);
    
    console.log('Load index button fixed');
    
    function handleLoadIndex() {
        console.log('Load index button clicked');
        newFileInput.value = '';
        newFileInput.click();
    }
    
    function handleFileChange(e) {
        console.log('File input changed');
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            console.log('Selected file:', file.name);
            
            if (window.moduleCloudInstance && window.moduleCloudInstance.loadModulesFromFile) {
                window.moduleCloudInstance.loadModulesFromFile(file);
            } else {
                console.error('Module cloud instance or loadModulesFromFile method not found');
            }
        }
    }
}

// Run fixes when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, applying fixes');
    
    // Run fixes
    fixSidebarToggle();
    fixModuleLoading();
    fixLoadIndexButton();
    
    console.log('All fixes applied');
});

// Also run fixes now in case DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Document already loaded, applying fixes immediately');
    setTimeout(function() {
        fixSidebarToggle();
        fixModuleLoading();
        fixLoadIndexButton();
    }, 500);
} 