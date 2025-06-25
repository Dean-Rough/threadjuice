#!/usr/bin/env node

/**
 * ThreadJuice Continuous Content Generator
 * Runs every hour indefinitely until manually stopped
 * 
 * Usage:
 *   node continuous-generator.js [options]
 *   
 * Options:
 *   --count <n>        Stories per hour (default: 3)
 *   --source <type>    Content source: reddit|twitter (default: reddit)
 *   --interval <mins>  Minutes between runs (default: 60)
 *   --max-daily <n>    Max stories per day (default: 50)
 *   --quiet            Minimal logging
 *   --stop             Stop any running instance
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
function loadEnvVars() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
  } catch (error) {
    // Use existing environment variables
  }
}

loadEnvVars();

// Configuration
const CONFIG = {
  count: 3,
  source: 'reddit',
  intervalMinutes: 60,
  maxDailyStories: 50,
  quiet: false,
  pidFile: path.join(process.cwd(), '.continuous-generator.pid'),
  stateFile: path.join(process.cwd(), '.continuous-generator-state.json'),
  logFile: path.join(process.cwd(), 'logs/automation/continuous-generator.log'),
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = { ...CONFIG };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--count':
        options.count = parseInt(args[++i]) || CONFIG.count;
        break;
      case '--source':
        const source = args[++i];
        if (['reddit', 'twitter'].includes(source)) {
          options.source = source;
        }
        break;
      case '--interval':
        options.intervalMinutes = parseInt(args[++i]) || CONFIG.intervalMinutes;
        break;
      case '--max-daily':
        options.maxDailyStories = parseInt(args[++i]) || CONFIG.maxDailyStories;
        break;
      case '--quiet':
        options.quiet = true;
        break;
      case '--stop':
        stopRunningInstance();
        process.exit(0);
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
ThreadJuice Continuous Content Generator

Runs every hour indefinitely, generating stories until manually stopped.

Usage:
  node continuous-generator.js [options]

Options:
  --count <n>        Stories per hour (default: ${CONFIG.count})
  --source <type>    Content source: reddit|twitter (default: ${CONFIG.source})
  --interval <mins>  Minutes between runs (default: ${CONFIG.intervalMinutes})
  --max-daily <n>    Max stories per day (default: ${CONFIG.maxDailyStories})
  --quiet            Minimal logging
  --stop             Stop any running instance
  --help, -h         Show this help

Examples:
  node continuous-generator.js                    # Default: 3 stories every hour
  node continuous-generator.js --count 5          # 5 stories every hour
  node continuous-generator.js --interval 30      # Every 30 minutes
  node continuous-generator.js --max-daily 100    # Up to 100 stories per day
  node continuous-generator.js --stop             # Stop running generator

Control:
  • View status: ps aux | grep continuous-generator
  • Stop: node continuous-generator.js --stop
  • Logs: tail -f logs/automation/continuous-generator.log
  • State: cat .continuous-generator-state.json
  `);
}

/**
 * Check if another instance is running
 */
function isRunning() {
  if (!existsSync(CONFIG.pidFile)) return false;
  
  try {
    const pid = parseInt(readFileSync(CONFIG.pidFile, 'utf8'));
    // Check if process exists
    process.kill(pid, 0);
    return true;
  } catch (error) {
    // Process doesn't exist, remove stale PID file
    try {
      unlinkSync(CONFIG.pidFile);
    } catch {}
    return false;
  }
}

/**
 * Stop running instance
 */
function stopRunningInstance() {
  if (!isRunning()) {
    console.log('❌ No continuous generator is currently running');
    return false;
  }

  try {
    const pid = parseInt(readFileSync(CONFIG.pidFile, 'utf8'));
    process.kill(pid, 'SIGTERM');
    
    // Wait a moment for graceful shutdown
    setTimeout(() => {
      try {
        process.kill(pid, 0);
        // Still running, force kill
        console.log('🔪 Force killing stubborn process...');
        process.kill(pid, 'SIGKILL');
      } catch {
        // Process stopped
      }
    }, 5000);
    
    console.log(`✅ Stopped continuous generator (PID: ${pid})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to stop generator:', error.message);
    return false;
  }
}

/**
 * Save state to file
 */
function saveState(state) {
  try {
    writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
  } catch (error) {
    console.log('⚠️  Failed to save state:', error.message);
  }
}

/**
 * Load state from file
 */
function loadState() {
  try {
    if (existsSync(CONFIG.stateFile)) {
      return JSON.parse(readFileSync(CONFIG.stateFile, 'utf8'));
    }
  } catch (error) {
    console.log('⚠️  Failed to load state:', error.message);
  }
  
  return {
    startTime: new Date().toISOString(),
    totalRuns: 0,
    totalStories: 0,
    totalSuccessful: 0,
    totalFailed: 0,
    lastRun: null,
    dailyCount: 0,
    dailyResetDate: new Date().toDateString(),
  };
}

/**
 * Logging function
 */
function log(...args) {
  const timestamp = new Date().toISOString();
  const message = args.join(' ');
  
  if (!CONFIG.quiet) {
    console.log(`[${timestamp}]`, ...args);
  }
  
  // Also write to log file
  try {
    const logDir = path.dirname(CONFIG.logFile);
    if (!existsSync(logDir)) {
      // Use sync mkdir to avoid async issues
      const fs = require('fs');
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logMessage = `[${timestamp}] ${message}\n`;
    writeFileSync(CONFIG.logFile, logMessage, { flag: 'a' });
  } catch (error) {
    // Fail silently if we can't write to log file
  }
}

/**
 * Generate stories using the existing script
 */
async function generateStories(options, state) {
  return new Promise((resolve) => {
    log(`🚀 Starting generation run #${state.totalRuns + 1}`);
    log(`📊 Target: ${options.count} stories from ${options.source}`);
    
    const scriptPath = path.join(__dirname, 'cron-content-generator.js');
    const args = [
      scriptPath,
      '--count', options.count.toString(),
      '--source', options.source,
    ];
    
    if (options.quiet) {
      args.push('--quiet');
    }
    
    const child = spawn('node', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      const success = code === 0;
      
      if (success) {
        // Parse output to get actual counts
        const successMatch = stdout.match(/Successful: (\d+)/);
        const attemptedMatch = stdout.match(/Attempted: (\d+)/);
        const failedMatch = stdout.match(/Failed: (\d+)/);
        
        const successful = successMatch ? parseInt(successMatch[1]) : 0;
        const attempted = attemptedMatch ? parseInt(attemptedMatch[1]) : 0;
        const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
        
        log(`✅ Generation completed: ${successful}/${attempted} stories successful`);
        
        resolve({
          success: true,
          attempted,
          successful,
          failed,
          output: stdout,
        });
      } else {
        log(`❌ Generation failed with code ${code}`);
        if (stderr) log('Error:', stderr.slice(0, 200));
        
        resolve({
          success: false,
          attempted: 0,
          successful: 0,
          failed: 1,
          error: stderr || `Exit code ${code}`,
        });
      }
    });
  });
}

/**
 * Check daily limits
 */
function checkDailyLimits(state, options) {
  const today = new Date().toDateString();
  
  // Reset daily counter if it's a new day
  if (state.dailyResetDate !== today) {
    state.dailyCount = 0;
    state.dailyResetDate = today;
    log(`📅 New day: Reset daily counter`);
  }
  
  if (state.dailyCount >= options.maxDailyStories) {
    log(`🛑 Daily limit reached: ${state.dailyCount}/${options.maxDailyStories} stories today`);
    return false;
  }
  
  return true;
}

/**
 * Main continuous loop
 */
async function runContinuously(options) {
  // Check if already running
  if (isRunning()) {
    console.error('❌ Continuous generator is already running');
    console.error('   Use --stop to stop it first');
    process.exit(1);
  }

  // Save PID
  writeFileSync(CONFIG.pidFile, process.pid.toString());
  
  // Load state
  let state = loadState();
  
  log('🤖 THREADJUICE CONTINUOUS GENERATOR STARTED');
  log('==========================================');
  log(`🎯 Configuration:`);
  log(`   • Stories per run: ${options.count}`);
  log(`   • Source: ${options.source}`);
  log(`   • Interval: ${options.intervalMinutes} minutes`);
  log(`   • Max daily: ${options.maxDailyStories}`);
  log(`   • PID: ${process.pid}`);
  log(`   • Log file: ${CONFIG.logFile}`);
  log('');
  log(`📊 Current state:`);
  log(`   • Total runs: ${state.totalRuns}`);
  log(`   • Total stories: ${state.totalStories}`);
  log(`   • Success rate: ${state.totalStories > 0 ? Math.round((state.totalSuccessful / state.totalStories) * 100) : 0}%`);
  log(`   • Today: ${state.dailyCount}/${options.maxDailyStories}`);
  log('');

  let isShuttingDown = false;

  // Graceful shutdown handlers
  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    log('');
    log('🛑 SHUTDOWN SIGNAL RECEIVED');
    log('============================');
    log(`📊 Final statistics:`);
    log(`   • Total runs: ${state.totalRuns}`);
    log(`   • Total stories generated: ${state.totalSuccessful}`);
    log(`   • Total stories attempted: ${state.totalStories}`);
    log(`   • Success rate: ${state.totalStories > 0 ? Math.round((state.totalSuccessful / state.totalStories) * 100) : 0}%`);
    log(`   • Runtime: ${Math.round((Date.now() - new Date(state.startTime).getTime()) / 1000 / 60)} minutes`);
    log('');
    log('✅ Continuous generator stopped gracefully');
    
    // Cleanup
    try {
      unlinkSync(CONFIG.pidFile);
    } catch {}
    
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Main loop
  while (!isShuttingDown) {
    try {
      // Check daily limits
      if (!checkDailyLimits(state, options)) {
        log(`😴 Sleeping until tomorrow (daily limit reached)`);
        // Sleep for the rest of the day
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const sleepTime = tomorrow.getTime() - now.getTime();
        
        await new Promise(resolve => setTimeout(resolve, sleepTime));
        continue;
      }

      // Run generation
      const result = await generateStories(options, state);
      
      // Update state
      state.totalRuns++;
      state.totalStories += result.attempted;
      state.totalSuccessful += result.successful;
      state.totalFailed += result.failed;
      state.lastRun = new Date().toISOString();
      state.dailyCount += result.successful;
      
      // Save state
      saveState(state);
      
      if (result.success) {
        log(`📈 Statistics: ${state.totalSuccessful}/${state.totalStories} total (${Math.round((state.totalSuccessful / state.totalStories) * 100)}% success)`);
      }

      // Wait for next interval
      const nextRun = new Date(Date.now() + options.intervalMinutes * 60 * 1000);
      log(`⏰ Next run scheduled for ${nextRun.toLocaleTimeString()}`);
      log(`😴 Sleeping for ${options.intervalMinutes} minutes...`);
      log('');
      
      await new Promise(resolve => setTimeout(resolve, options.intervalMinutes * 60 * 1000));
      
    } catch (error) {
      log('❌ Unexpected error:', error.message);
      
      // Wait before retrying
      log('⏳ Waiting 5 minutes before retry...');
      await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();
  
  // Merge with CONFIG
  Object.assign(CONFIG, options);
  
  await runContinuously(options);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}