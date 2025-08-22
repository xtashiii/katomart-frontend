#!/usr/bin/env node
/**
 * Katomart Localization Fixer
 * 
 * A tool to automatically translate and fix localization issues using translation APIs.
 * Usage: node tools/localization-fixer.js [--api=google|libre|deepl] [--api-key=KEY]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class LocalizationFixer {
  constructor(options = {}) {
    this.messagesDir = path.join(__dirname, '..', 'messages');
    this.files = {
      en: path.join(this.messagesDir, 'en.json'),
      es: path.join(this.messagesDir, 'es.json'),
      pt: path.join(this.messagesDir, 'pt.json')
    };
    
    // Translation API configuration
    this.apiProvider = options.api || 'libre'; // Default to LibreTranslate (free)
    this.apiKey = options.apiKey || process.env.TRANSLATE_API_KEY;
    this.apiUrl = this.getApiUrl();
    
    // Language mappings
    this.languageCodes = {
      es: 'es', // Spanish
      pt: 'pt'  // Portuguese
    };
    
    // Translation cache to avoid redundant API calls
    this.translationCache = new Map();
  }

  // Get API URL based on provider
  getApiUrl() {
    switch (this.apiProvider) {
      case 'google':
        return 'https://translation.googleapis.com/language/translate/v2';
      case 'deepl':
        return 'https://api-free.deepl.com/v2/translate';
      case 'libre':
      default:
        return 'https://libretranslate.de/translate'; // Free LibreTranslate instance
    }
  }

  // Make HTTP request
  makeRequest(url, options, postData = null) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https://');
      const client = isHttps ? https : http;
      
      const req = client.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      
      if (postData) {
        req.write(postData);
      }
      
      req.end();
    });
  }

  // Translate text using the configured API
  async translateText(text, targetLang) {
    const cacheKey = `${text}:${targetLang}`;
    
    // Check cache first
    if (this.translationCache.has(cacheKey)) {
      return this.translationCache.get(cacheKey);
    }

    try {
      let translation;
      
      switch (this.apiProvider) {
        case 'google':
          translation = await this.translateWithGoogle(text, targetLang);
          break;
        case 'deepl':
          translation = await this.translateWithDeepL(text, targetLang);
          break;
        case 'libre':
        default:
          translation = await this.translateWithLibre(text, targetLang);
          break;
      }

      // Cache the result
      this.translationCache.set(cacheKey, translation);
      return translation;
      
    } catch (error) {
      console.warn(`⚠️  Translation failed for "${text}" to ${targetLang}: ${error.message}`);
      return `[TRANSLATE] ${text}`; // Fallback
    }
  }

  // Google Translate API
  async translateWithGoogle(text, targetLang) {
    if (!this.apiKey) {
      throw new Error('Google Translate API key required');
    }

    const url = `${this.apiUrl}?key=${this.apiKey}`;
    const postData = JSON.stringify({
      q: text,
      source: 'en',
      target: targetLang,
      format: 'text'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const result = await this.makeRequest(url, options, postData);
    return result.data.translations[0].translatedText;
  }

  // DeepL API
  async translateWithDeepL(text, targetLang) {
    if (!this.apiKey) {
      throw new Error('DeepL API key required');
    }

    const postData = new URLSearchParams({
      auth_key: this.apiKey,
      text: text,
      source_lang: 'EN',
      target_lang: targetLang.toUpperCase()
    }).toString();

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const result = await this.makeRequest(this.apiUrl, options, postData);
    return result.translations[0].text;
  }

  // LibreTranslate API (Free)
  async translateWithLibre(text, targetLang) {
    const postData = JSON.stringify({
      q: text,
      source: 'en',
      target: targetLang,
      format: 'text'
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const result = await this.makeRequest(this.apiUrl, options, postData);
    return result.translatedText;
  }



  // Load a JSON file
  loadFile(lang) {
    try {
      const filePath = this.files[lang];
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
      throw new Error(`File not found: ${filePath}`);
    } catch (error) {
      console.error(`❌ Error loading ${lang}.json:`, error.message);
      return null;
    }
  }

  // Save a JSON file with proper formatting
  saveFile(lang, data) {
    try {
      const filePath = this.files[lang];
      const jsonString = JSON.stringify(data, null, 2) + '\n';
      fs.writeFileSync(filePath, jsonString, 'utf8');
      console.log(`✅ Updated ${lang}.json`);
      return true;
    } catch (error) {
      console.error(`❌ Error saving ${lang}.json:`, error.message);
      return false;
    }
  }

  // Set value by dot notation path
  setValueByPath(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Get value by dot notation path
  getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Extract all keys recursively
  extractKeys(obj, prefix = '') {
    const keys = [];
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        keys.push(fullKey);
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          keys.push(...this.extractKeys(obj[key], fullKey));
        }
      }
    }
    
    return keys;
  }

  // Compare keys between languages
  findMissingKeys(enData, targetData) {
    const enKeys = new Set(this.extractKeys(enData));
    const targetKeys = new Set(this.extractKeys(targetData));
    
    return Array.from(enKeys).filter(key => !targetKeys.has(key));
  }

  // Fix all localization files using translation API
  async fix() {
    console.log('🔧 Katomart Localization Fixer (AI-Powered)\n');
    console.log(`Using ${this.apiProvider.toUpperCase()} translation API\n`);
    
    // Load all files
    const data = {};
    for (const lang of ['en', 'es', 'pt']) {
      data[lang] = this.loadFile(lang);
      if (!data[lang]) {
        console.error(`❌ Failed to load ${lang}.json, aborting.`);
        return false;
      }
    }

    const enData = data.en;
    let totalAdded = 0;

    // Process each target language
    for (const targetLang of ['es', 'pt']) {
      console.log(`🌐 Processing ${targetLang.toUpperCase()}...`);
      
      const missingKeys = this.findMissingKeys(enData, data[targetLang]);
      
      if (missingKeys.length === 0) {
        console.log(`✅ ${targetLang.toUpperCase()}: No missing keys`);
        continue;
      }

      console.log(`📝 Found ${missingKeys.length} missing keys in ${targetLang.toUpperCase()}`);
      
      // Translate missing keys
      for (const keyPath of missingKeys) {
        const englishValue = this.getValueByPath(enData, keyPath);
        
        if (englishValue && typeof englishValue === 'string') {
          try {
            console.log(`🔄 Translating: "${englishValue}"`);
            const translation = await this.translateText(englishValue, this.languageCodes[targetLang]);
            
            this.setValueByPath(data[targetLang], keyPath, translation);
            console.log(`✅ Added to ${targetLang.toUpperCase()}: ${keyPath} = "${translation}"`);
            totalAdded++;
            
            // Small delay to be respectful to the API
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.error(`❌ Failed to translate ${keyPath}: ${error.message}`);
            // Use fallback
            this.setValueByPath(data[targetLang], keyPath, `[TRANSLATE] ${englishValue}`);
            totalAdded++;
          }
        }
      }
      
      console.log(); // Empty line for readability
    }

    if (totalAdded === 0) {
      console.log('✅ All localization files are already consistent!');
      return true;
    }

    // Save all modified files
    let allSaved = true;
    for (const lang of ['es', 'pt']) {
      if (this.findMissingKeys(enData, data[lang]).length === 0) {
        continue; // Skip if no changes
      }
      
      if (!this.saveFile(lang, data[lang])) {
        allSaved = false;
      }
    }

    if (allSaved) {
      console.log(`🎉 Successfully translated and added ${totalAdded} missing keys!`);
      console.log('✅ All localization files are now consistent.');
      
      if (this.translationCache.size > 0) {
        console.log(`💾 Cached ${this.translationCache.size} translations for future use.`);
      }
    } else {
      console.log('\n❌ Some files failed to save. Please check the errors above.');
    }

    return allSaved;
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Katomart Localization Fixer (AI-Powered)

Usage: node tools/localization-fixer.js [options]

This tool automatically translates and adds missing keys to localization files.
English is used as the source of truth for all translations.

Options:
  --api=PROVIDER     Translation API provider (libre|google|deepl) [default: libre]
  --api-key=KEY      API key for the translation service (required for google/deepl)
  --help, -h         Show this help message

Environment Variables:
  TRANSLATE_API_KEY  API key for translation service (alternative to --api-key)

Supported APIs:
  libre              LibreTranslate (free, no API key required) [default]
  google             Google Translate API (requires API key)
  deepl              DeepL API (requires API key)

Examples:
  node tools/localization-fixer.js                           # Use free LibreTranslate
  node tools/localization-fixer.js --api=google --api-key=KEY  # Use Google Translate
  node tools/localization-fixer.js --api=deepl --api-key=KEY   # Use DeepL
  TRANSLATE_API_KEY=KEY node tools/localization-fixer.js --api=google  # Use env var
`);
    process.exit(0);
  }

  // Parse command line arguments
  const options = {};
  
  for (const arg of args) {
    if (arg.startsWith('--api=')) {
      options.api = arg.split('=')[1];
    } else if (arg.startsWith('--api-key=')) {
      options.apiKey = arg.split('=')[1];
    }
  }

  const fixer = new LocalizationFixer(options);
  
  // Run the fixer (async)
  fixer.fix()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error.message);
      process.exit(1);
    });
}

module.exports = LocalizationFixer;
