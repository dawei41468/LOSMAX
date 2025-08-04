#!/usr/bin/env node

/**
 * i18n Migration Utility - Simple JavaScript version
 * 
 * This script helps migrate components from old i18n keys to new structured keys.
 * Usage: node scripts/i18n-migrate.js --report
 *        node scripts/i18n-migrate.js --component=QuoteOfDay
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrationMap = {
  'common.save_changes_button': 'actions.save',
  'common.cancel': 'actions.cancel',
  'common.delete_button': 'actions.delete',
  'common.create_button': 'actions.create',
  'common.update_button': 'actions.update',
  'dashboard.quotes.daily': 'content.dashboard.dailyQuote',
  'dashboard.quotes': 'content.dashboard.quotes',
  'dashboard.user_fallback': 'content.dashboard.userFallback',
  'progressPage.overview': 'content.progress.title',
  'progressPage.stats.totalGoals': 'content.progress.stats.totalGoals',
  'progressPage.stats.completedGoals': 'content.progress.stats.completedGoals',
  'progressPage.stats.inProgressGoals': 'content.progress.stats.inProgressGoals',
  'progressPage.stats.avgTaskCompletion': 'content.progress.stats.avgTaskCompletion',
  'progressPage.analytics.completionRate': 'content.progress.completionRate',
  'progressPage.analytics.completedOn': 'time.completedOn',
  'common.progress': 'navigation.progress',
  'common.profile': 'navigation.profile',
  'common.categories.family': 'content.goals.categories.family',
  'common.categories.work': 'content.goals.categories.work',
  'common.categories.health': 'content.goals.categories.health',
  'common.categories.personal': 'content.goals.categories.personal',
  'tasks.create': 'actions.create',
  'tasks.update': 'actions.update',
  'auth.loginError': 'feedback.error.login',
  'auth.alreadyHaveAccount': 'content.auth.alreadyHaveAccount',
  'auth.dontHaveAccount': 'content.auth.dontHaveAccount',
  'auth.signInTitle': 'content.auth.signInTitle',
  'auth.signIn': 'content.auth.signIn',
  'profile.tabs.info': 'content.profile.tabs.info',
  'profile.tabs.preference': 'content.profile.tabs.preference',
  'profile.tabs.about': 'content.profile.tabs.about',
  'content.profile.content.info': 'content.profile.sections.info',
  'content.profile.content.preference': 'content.profile.sections.preference',
  'content.profile.content.about': 'content.profile.sections.about',
  'settings.toast.settings_saved_message': 'feedback.success.settings_saved',
  'dashboard.titles.goals': 'content.goals.title',
  'common.loading': 'common.loading',
  'common.error': 'feedback.error.generic'
};

class I18nMigration {
  constructor() {
    this.oldKeys = Object.keys(migrationMap);
    this.keyRegex = new RegExp(`t\\(['"](${this.oldKeys.join('|')})(?:\\.[^'"]+)?['"])`, 'g');
  }

  migrateFile(filePath) {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    let changes = 0;
    let newContent = content;

    // Replace old keys with new ones
    for (const [oldKey, newKey] of Object.entries(migrationMap)) {
      const regex = new RegExp(`t\\(['"]${oldKey}(?:\\.[^'"]+)?['"]`, 'g');
      const matches = newContent.match(regex);
      
      if (matches) {
        changes += matches.length;
        newContent = newContent.replace(regex, (match) => {
          // Handle nested keys like dashboard.quotes.1
          if (match.includes('.')) {
            const parts = match.split('.');
            const baseKey = parts[1].replace(/['"]/g, '');
            if (oldKey === `dashboard.quotes.${baseKey}`) {
              return `t('content.dashboard.quotes.${baseKey}'`;
            }
          }
          return match.replace(oldKey, newKey);
        });
      }
    }

    return { changes, content: newContent };
  }

  migrateComponent(componentName) {
    const searchPath = path.join(__dirname, '..', 'src');
    const files = this.findComponentFiles(searchPath, componentName);
    
    for (const file of files) {
      const { changes, content } = this.migrateFile(file);
      if (changes > 0) {
        console.log(`✅ Migrated ${changes} keys in ${file}`);
        fs.writeFileSync(file, content);
      } else {
        console.log(`ℹ️  No changes needed in ${file}`);
      }
    }
  }

  findComponentFiles(searchPath, componentName) {
    const files = [];
    
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (stat.isFile() && item.endsWith('.tsx') && item.includes(componentName)) {
          files.push(fullPath);
        }
      }
    };
    
    walkDir(searchPath);
    return files;
  }

  generateReport() {
    const searchPath = path.join(__dirname, '..', 'src');
    const files = this.findAllTsxFiles(searchPath);
    const report = {};
    
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const matches = content.match(this.keyRegex);
      if (matches) {
        report[file] = matches.length;
      }
    }
    
    console.log('\n📊 Migration Report:');
    console.log('===================');
    
    const totalFiles = Object.keys(report).length;
    const totalKeys = Object.values(report).reduce((sum, count) => sum + count, 0);
    
    console.log(`Files needing migration: ${totalFiles}`);
    console.log(`Total keys to migrate: ${totalKeys}`);
    
    if (totalFiles > 0) {
      console.log('\nFiles by key count:');
      Object.entries(report)
        .sort(([, a], [, b]) => b - a)
        .forEach(([file, count]) => {
          console.log(`  ${file}: ${count} keys`);
        });
    }
    
    return report;
  }

  findAllTsxFiles(searchPath) {
    const files = [];
    
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          walkDir(fullPath);
        } else if (stat.isFile() && item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    };
    
    walkDir(searchPath);
    return files;
  }
}

// CLI interface
const args = process.argv.slice(2);
const migration = new I18nMigration();

if (args.includes('--report')) {
  migration.generateReport();
} else if (args.some(arg => arg.startsWith('--component='))) {
  const componentArg = args.find(arg => arg.startsWith('--component='));
  if (componentArg) {
    const componentName = componentArg.split('=')[1];
    migration.migrateComponent(componentName);
  }
} else if (args.some(arg => arg.startsWith('--file='))) {
  const fileArg = args.find(arg => arg.startsWith('--file='));
  if (fileArg) {
    const filePath = fileArg.split('=')[1];
    const { changes } = migration.migrateFile(filePath);
    console.log(`Migrated ${changes} keys in ${filePath}`);
  }
} else {
  console.log(`
🌍 i18n Migration Utility

Usage:
  node scripts/i18n-migrate.js --report              # Generate migration report
  node scripts/i18n-migrate.js --component=QuoteOfDay # Migrate specific component
  node scripts/i18n-migrate.js --file=src/components/dashboard/QuoteOfDay.tsx # Migrate specific file
  `);
}

export default I18nMigration;
