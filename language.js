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
  
  // Update active state on language buttons
  document.querySelectorAll('.language-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    }
  });
}

// Initialize language from localStorage or default to English
function initializeLanguage() {
  const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
  setLanguage(savedLanguage);
}
