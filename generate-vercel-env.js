#!/usr/bin/env node

/**
 * Generate Vercel Environment Variables from .env.local
 * 
 * Usage:
 * 1. Run: node generate-vercel-env.js
 * 2. Copy the output
 * 3. Paste in Vercel Dashboard → Environment Variables
 */

const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envFilePath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envFilePath, 'utf-8');
const lines = envContent.split('\n');

console.log('\n🚀 Vercel Environment Variables\n');
console.log('Copy and paste these in Vercel Dashboard:\n');
console.log('─'.repeat(60));

lines.forEach((line) => {
  line = line.trim();
  
  // Skip empty lines and comments
  if (!line || line.startsWith('#')) {
    return;
  }
  
  // Parse KEY=VALUE
  const equalIndex = line.indexOf('=');
  if (equalIndex === -1) {
    return;
  }
  
  const key = line.substring(0, equalIndex).trim();
  let value = line.substring(equalIndex + 1).trim();
  
  // Remove quotes if present
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  
  console.log(`${key}=${value}`);
});

console.log('─'.repeat(60));
console.log('\n✅ Done! Copy these to Vercel Environment Variables\n');
console.log('📋 Steps:');
console.log('1. Go to Vercel Dashboard');
console.log('2. Select your project');
console.log('3. Settings → Environment Variables');
console.log('4. Paste each variable (or use bulk import)');
console.log('5. Set for Production, Preview, and Development\n');
