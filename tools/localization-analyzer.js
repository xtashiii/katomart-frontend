#!/usr/bin/env node
/**
 * Katomart Localization Analyzer
 * 
 * A tool to analyze and compare localization files for consistency.
 * Usage: node tools/localization-analyzer.js [--fix] [--verbose]
 */

const fs = require('fs');
const path = require('path');

class LocalizationAnalyzer {
  constructor(options = {}) {
    this.options = {
      fix: false,
      verbose: false,
      ...options
    };
    
    this.messagesDir = path.join(__dirname, '..', 'messages');
    this.files = {
      en: path.join(this.messagesDir, 'en.json'),
      es: path.join(this.messagesDir, 'es.json'),
      pt: path.join(this.messagesDir, 'pt.json')
    };
  }

  // Recursively extract all keys from an object
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

  // Get value by dot notation path
  getValueByPath(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
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

  // Check for duplicate keys at each level
  checkDuplicates(obj, path = '') {
    const duplicates = [];
    const keys = Object.keys(obj);
    const keyCount = {};
    
    keys.forEach(key => {
      keyCount[key] = (keyCount[key] || 0) + 1;
    });
    
    Object.entries(keyCount).forEach(([key, count]) => {
      if (count > 1) {
        duplicates.push(`${path}${key} (appears ${count} times)`);
      }
    });
    
    keys.forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        duplicates.push(...this.checkDuplicates(obj[key], `${path}${key}.`));
      }
    });
    
    return duplicates;
  }

  // Compare two arrays of keys
  compareKeys(keys1, keys2) {
    const set1 = new Set(keys1);
    const set2 = new Set(keys2);
    
    return {
      onlyIn1: keys1.filter(key => !set2.has(key)),
      onlyIn2: keys2.filter(key => !set1.has(key)),
      common: keys1.filter(key => set2.has(key))
    };
  }

  // Load all localization files
  loadFiles() {
    const data = {};
    
    try {
      for (const [lang, filePath] of Object.entries(this.files)) {
        if (fs.existsSync(filePath)) {
          data[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
          console.warn(`⚠️  Warning: ${filePath} not found`);
        }
      }
      return data;
    } catch (error) {
      console.error('❌ Error loading files:', error.message);
      process.exit(1);
    }
  }

  // Save a localization file with proper formatting
  saveFile(lang, data) {
    try {
      const filePath = this.files[lang];
      const jsonString = JSON.stringify(data, null, 2) + '\n';
      fs.writeFileSync(filePath, jsonString, 'utf8');
      console.log(`✅ Updated ${lang}.json`);
    } catch (error) {
      console.error(`❌ Error saving ${lang}.json:`, error.message);
    }
  }

  // Main analysis function
  analyze() {
    console.log('🔍 Katomart Localization Analyzer\n');
    
    const data = this.loadFiles();
    const languages = Object.keys(data);
    
    if (languages.length === 0) {
      console.error('❌ No localization files found!');
      return;
    }

    // Extract keys from each file
    const allKeys = {};
    const allKeysFlat = {};
    
    for (const lang of languages) {
      allKeys[lang] = this.extractKeys(data[lang]).sort();
      allKeysFlat[lang] = new Set(allKeys[lang]);
    }

    console.log('📊 KEY COUNTS:');
    for (const lang of languages) {
      console.log(`${lang.toUpperCase()}: ${allKeys[lang].length} keys`);
    }
    console.log();

    // Check for duplicates
    console.log('🔍 DUPLICATE KEY CHECK:');
    let hasDuplicates = false;
    for (const lang of languages) {
      const duplicates = this.checkDuplicates(data[lang]);
      if (duplicates.length > 0) {
        console.log(`❌ ${lang.toUpperCase()}: ${duplicates.join(', ')}`);
        hasDuplicates = true;
      } else {
        console.log(`✅ ${lang.toUpperCase()}: No duplicates found`);
      }
    }
    if (!hasDuplicates) {
      console.log('✅ No duplicate keys found in any file');
    }
    console.log();

    // Compare between languages
    const comparisons = [];
    const missingKeys = {};
    
    for (let i = 0; i < languages.length; i++) {
      for (let j = i + 1; j < languages.length; j++) {
        const lang1 = languages[i];
        const lang2 = languages[j];
        const comparison = this.compareKeys(allKeys[lang1], allKeys[lang2]);
        
        comparisons.push({
          lang1,
          lang2,
          ...comparison
        });
        
        // Track missing keys for fixing
        if (!missingKeys[lang1]) missingKeys[lang1] = new Set();
        if (!missingKeys[lang2]) missingKeys[lang2] = new Set();
        
        comparison.onlyIn1.forEach(key => missingKeys[lang2].add(key));
        comparison.onlyIn2.forEach(key => missingKeys[lang1].add(key));
      }
    }

    // Display comparisons
    let hasInconsistencies = false;
    for (const comp of comparisons) {
      console.log(`🔄 COMPARISON: ${comp.lang1.toUpperCase()} vs ${comp.lang2.toUpperCase()}`);
      
      if (comp.onlyIn1.length > 0) {
        console.log(`❌ Keys only in ${comp.lang1.toUpperCase()} (${comp.onlyIn1.length}):`);
        if (this.options.verbose) {
          comp.onlyIn1.forEach(key => {
            const value = this.getValueByPath(data[comp.lang1], key);
            console.log(`  - ${key}: "${value}"`);
          });
        } else {
          console.log(`  ${comp.onlyIn1.slice(0, 5).join(', ')}${comp.onlyIn1.length > 5 ? '...' : ''}`);
        }
        hasInconsistencies = true;
      }
      
      if (comp.onlyIn2.length > 0) {
        console.log(`❌ Keys only in ${comp.lang2.toUpperCase()} (${comp.onlyIn2.length}):`);
        if (this.options.verbose) {
          comp.onlyIn2.forEach(key => {
            const value = this.getValueByPath(data[comp.lang2], key);
            console.log(`  - ${key}: "${value}"`);
          });
        } else {
          console.log(`  ${comp.onlyIn2.slice(0, 5).join(', ')}${comp.onlyIn2.length > 5 ? '...' : ''}`);
        }
        hasInconsistencies = true;
      }
      
      if (comp.onlyIn1.length === 0 && comp.onlyIn2.length === 0) {
        console.log('✅ All keys match');
      }
      console.log();
    }

    // Summary
    console.log('📋 SUMMARY:');
    const allKeysCount = new Set(Object.values(allKeys).flat()).size;
    console.log(`Total unique keys across all files: ${allKeysCount}`);
    console.log(`Structure consistency: ${hasInconsistencies ? '❌ INCONSISTENT' : '✅ CONSISTENT'}`);
    console.log(`Duplicate keys: ${hasDuplicates ? '❌ FOUND' : '✅ NONE'}`);

    // Fix inconsistencies if requested
    if (this.options.fix && hasInconsistencies) {
      console.log('\n🔧 FIXING INCONSISTENCIES...');
      this.fixInconsistencies(data, missingKeys);
    } else if (hasInconsistencies) {
      console.log('\n💡 Run with --fix to automatically resolve inconsistencies');
    }

    return {
      consistent: !hasInconsistencies && !hasDuplicates,
      totalKeys: allKeysCount,
      missingKeys
    };
  }

  // Fix inconsistencies by adding missing keys
  fixInconsistencies(data, missingKeys) {
    // Use English as the reference language
    const referenceLang = 'en';
    const referenceData = data[referenceLang];
    
    if (!referenceData) {
      console.error('❌ English reference file not found for fixing');
      return;
    }

    for (const [lang, missing] of Object.entries(missingKeys)) {
      if (lang === referenceLang || missing.size === 0) continue;
      
      console.log(`\n🔧 Fixing ${lang.toUpperCase()}...`);
      const langData = data[lang];
      
      for (const missingKey of missing) {
        const referenceValue = this.getValueByPath(referenceData, missingKey);
        if (referenceValue !== undefined) {
          this.setValueByPath(langData, missingKey, `[TRANSLATE] ${referenceValue}`);
          console.log(`  + Added ${missingKey}`);
        }
      }
      
      this.saveFile(lang, langData);
    }
    
    console.log('\n✅ Fix complete! Please translate the [TRANSLATE] prefixed values.');
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Katomart Localization Analyzer

Usage: node tools/localization-analyzer.js [options]

Options:
  --fix      Automatically fix inconsistencies by adding missing keys
  --verbose  Show detailed key listings
  -v         Short for --verbose
  --help     Show this help message
  -h         Short for --help

Examples:
  node tools/localization-analyzer.js                    # Analyze only
  node tools/localization-analyzer.js --fix             # Analyze and fix
  node tools/localization-analyzer.js --verbose --fix   # Verbose analysis and fix
`);
    process.exit(0);
  }

  const analyzer = new LocalizationAnalyzer(options);
  analyzer.analyze();
}

module.exports = LocalizationAnalyzer;
