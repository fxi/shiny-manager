#!/usr/bin/env node

import { build } from 'esbuild';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir, copyFile, cp, chmod } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

async function bundleApplication() {
  console.log('🏗️  Bundling application...');
  
  // Ensure dist directories exist
  await mkdir(distDir, { recursive: true });
  await mkdir(join(distDir, 'bin'), { recursive: true });
  
  try {
    // Bundle main CLI entry point
    await build({
      entryPoints: [join(rootDir, 'src/bin/shiny-manager.js')],
      bundle: true,
      platform: 'node',
      target: ['node18'],
      format: 'esm',
      outfile: join(distDir, 'bin/shiny-manager.js'),
      minify: true,
      metafile: true,
      external: ['socket.io', 'express', 'http-proxy', 'uuid'],
      legalComments: 'inline',
    });
    
    // Bundle other modules that might be imported directly
    await build({
      entryPoints: [
        join(rootDir, 'src/index.js'),
        join(rootDir, 'src/proxy.js'),
        join(rootDir, 'src/session.js'),
        join(rootDir, 'src/utils.js'),
      ],
      bundle: true,
      platform: 'node',
      target: ['node18'],
      format: 'esm',
      outdir: distDir,
      minify: true,
      metafile: true,
      external: ['socket.io', 'express', 'http-proxy', 'uuid'],
    });
    
    // Copy public directory for front-end assets
    await mkdir(join(distDir, 'public'), { recursive: true });
    
    // Copy public files
    await cp(join(rootDir, 'src/public'), join(distDir, 'public'), { recursive: true });
    
    // Copy package.json to dist for version info
    await copyFile(join(rootDir, 'package.json'), join(distDir, 'package.json'));
    
    // Make the CLI executable
    await chmod(join(distDir, 'bin/shiny-manager.js'), '755');
    
    console.log('✅ Successfully bundled application to dist/');
    console.log('🚀 Ready for Single Executable Application creation');
  } catch (error) {
    console.error('❌ Error bundling application:', error);
    process.exit(1);
  }
}

bundleApplication();