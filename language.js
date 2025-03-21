// Language translations
const translations = {
  en: {
    login: "Login",
    saveIndex: "Save<br>Index",
    loadIndex: "Load<br>Index",
    addModule: "Add<br>Module",
    deleteModule: "Delete<br>Module",
    editModule: "Edit<br>Module"
  },
  he: {
    login: "התחברות",
    saveIndex: "שמור<br>אינדקס",
    loadIndex: "טען<br>אינדקס",
    addModule: "הוסף<br>מודול",
    deleteModule: "מחק<br>מודול",
    editModule: "ערוך<br>מודול"
  },
  zh: {
    login: "登录",
    saveIndex: "保存<br>索引",
    loadIndex: "加载<br>索引",
    addModule: "添加<br>模块",
    deleteModule: "删除<br>模块",
    editModule: "编辑<br>模块"
  }
};

// Function to set language
function setLanguage(lang) {
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[lang] && translations[lang][key]) {
      element.innerHTML = translations[lang][key];
    }
  });
  
  // Store the selected language in localStorage
  localStorage.setItem('selectedLanguage', lang);
  
  // Update language toggle button text
  const languageToggle = document.getElementById('languageToggle');
  if (languageToggle) {
    if (lang === 'en') languageToggle.textContent = 'EN';
    else if (lang === 'he') languageToggle.textContent = 'HE';
    else if (lang === 'zh') languageToggle.textContent = '中文';
  }
}

// Initialize language from localStorage or default to English
function initializeLanguage() {
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  console.log(`Initializing language to ${savedLanguage}`);
  setLanguage(savedLanguage);
  
  // Force update of all translatable elements on initialization
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[savedLanguage] && translations[savedLanguage][key]) {
      element.innerHTML = translations[savedLanguage][key];
    }
  });
}

// Function to cycle through languages
function cycleLanguage() {
  const currentLang = localStorage.getItem('selectedLanguage') || 'en';
  let nextLang;
  
  if (currentLang === 'en') nextLang = 'he';
  else if (currentLang === 'he') nextLang = 'zh';
  else nextLang = 'en';
  
  console.log(`Cycling language from ${currentLang} to ${nextLang}`);
  setLanguage(nextLang);
  
  // Force update of all translatable elements
  document.querySelectorAll('[data-translate]').forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[nextLang] && translations[nextLang][key]) {
      element.innerHTML = translations[nextLang][key];
    }
  });
}
