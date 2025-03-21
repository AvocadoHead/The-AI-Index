// Function to export modules to CSV format
function exportModulesToCSV() {
  // Combine free and premium modules
  const allModules = [];
  
  if (window.defaultModules && Array.isArray(window.defaultModules)) {
    allModules.push(...window.defaultModules);
  }
  
  if (window.premiumModules && Array.isArray(window.premiumModules)) {
    allModules.push(...window.premiumModules);
  }
  
  if (allModules.length === 0) {
    alert('No modules found to export');
    return;
  }
  
  // Create CSV header
  let csv = 'name,url,categories,is_premium\n';
  
  // Add each module as a row
  allModules.forEach(module => {
    const name = module.name.replace(/,/g, ' ');
    const url = module.url.replace(/,/g, ' ');
    const categories = JSON.stringify(module.categories).replace(/,/g, ';');
    const isPremium = module.isPremium ? 'true' : 'false';
    
    csv += `${name},${url},${categories},${isPremium}\n`;
  });
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'ai_modules.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Function to import modules to Supabase
async function importModulesToSupabase() {
  try {
    // Check if user is authenticated and has admin rights
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user || user.user_metadata?.is_admin !== true) {
      alert('You need admin privileges to import modules to the database');
      return;
    }
    
    // Combine free and premium modules
    const allModules = [];
    
    if (window.defaultModules && Array.isArray(window.defaultModules)) {
      allModules.push(...window.defaultModules.map(m => ({...m, is_premium: false})));
    }
    
    if (window.premiumModules && Array.isArray(window.premiumModules)) {
      allModules.push(...window.premiumModules.map(m => ({...m, is_premium: true})));
    }
    
    if (allModules.length === 0) {
      alert('No modules found to import');
      return;
    }
    
    // Prepare modules for database insertion
    const modulesForDB = allModules.map(module => ({
      name: module.name,
      url: module.url,
      categories: module.categories,
      scores: module.scores || {},
      is_premium: module.is_premium || false
    }));
    
    // Insert modules in batches of 50 to avoid request size limits
    const batchSize = 50;
    let successCount = 0;
    
    for (let i = 0; i < modulesForDB.length; i += batchSize) {
      const batch = modulesForDB.slice(i, i + batchSize);
      
      const { data, error } = await window.supabase
        .from('modules')
        .upsert(batch, { onConflict: 'name' });
      
      if (error) {
        console.error('Error importing modules batch:', error);
        alert(`Error importing modules batch ${i/batchSize + 1}: ${error.message}`);
      } else {
        successCount += batch.length;
        console.log(`Imported batch ${i/batchSize + 1}, total: ${successCount} modules`);
      }
    }
    
    alert(`Successfully imported ${successCount} modules to the database`);
  } catch (error) {
    console.error('Error in importModulesToSupabase:', error);
    alert('An error occurred during module import. See console for details.');
  }
}

// Function to add admin tools to the UI for authorized users
async function addAdminTools() {
  try {
    // Check if user is authenticated and has admin rights
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user || user.user_metadata?.is_admin !== true) {
      return; // Not an admin, don't add tools
    }
    
    // Create admin tools container
    const adminTools = document.createElement('div');
    adminTools.className = 'admin-tools';
    
    // Create export button
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Modules CSV';
    exportButton.addEventListener('click', exportModulesToCSV);
    
    // Create import button
    const importButton = document.createElement('button');
    importButton.textContent = 'Import to Database';
    importButton.addEventListener('click', importModulesToSupabase);
    
    // Add buttons to container
    adminTools.appendChild(exportButton);
    adminTools.appendChild(importButton);
    
    // Add to controls section
    const controlsDiv = document.querySelector('.controls');
    if (controlsDiv) {
      controlsDiv.appendChild(adminTools);
    }
  } catch (error) {
    console.error('Error in addAdminTools:', error);
  }
}
