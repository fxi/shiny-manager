#!/usr/bin/env node

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir, cp, chmod, rm } from 'fs/promises';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

async function build() {
  console.log('🏗️  Building shiny-manager...');
  
  try {
    // Ensure dist directory structure
    await mkdir(join(rootDir, 'dist'), { recursive: true });
    await mkdir(join(rootDir, 'dist/bin'), { recursive: true });
    await mkdir(join(rootDir, 'dist/public'), { recursive: true });
    
    // Build the client
    console.log('📦 Building client...');
    process.chdir(join(rootDir, 'client'));
    execSync('npm install', { stdio: 'inherit' });
    execSync('npm run build', { stdio: 'inherit' });
    
    // Return to root directory
    process.chdir(rootDir);
    
    // Copy client build to public directory
    console.log('📋 Copying client build to public directory...');
    await cp(join(rootDir, 'client/dist'), join(rootDir, 'dist/public'), { recursive: true });
    
    // Copy server files
    console.log('📋 Copying server files...');
    await cp(join(rootDir, 'src'), join(rootDir, 'dist'), { 
      recursive: true
    });
    
    // Make the CLI executable
    console.log('🔑 Making CLI executable...');
    await chmod(join(rootDir, 'dist/bin/shiny-manager.js'), '755');
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();