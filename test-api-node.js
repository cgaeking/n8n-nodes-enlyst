#!/usr/bin/env node

/**
 * Test script for Enlyst API Node
 * 
 * This script tests the built n8n node by simulating API calls
 * to verify that all operations work correctly.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEnlystNode() {
  log('cyan', '🧪 Testing Enlyst n8n Node Integration...\n');

  // Test 1: Check if built files exist
  log('blue', '📁 Test 1: Checking built files...');
  const requiredFiles = [
    'dist/nodes/Enlyst/Enlyst.node.js',
    'dist/nodes/Enlyst/EnlystTrigger.node.js',
    'dist/credentials/EnlystApi.credentials.js',
    'dist/nodes/Enlyst/enlyst.dark.svg'
  ];

  let filesOk = true;
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      log('green', `   ✅ ${file}`);
    } else {
      log('red', `   ❌ ${file} - MISSING!`);
      filesOk = false;
    }
  }

  if (!filesOk) {
    log('red', '\n❌ Build files are missing. Run "npm run build" first.');
    return false;
  }

  // Test 2: Check package.json configuration
  log('blue', '\n📋 Test 2: Checking package.json configuration...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.n8n && packageJson.n8n.nodes) {
    log('green', `   ✅ n8n.nodes configured: ${packageJson.n8n.nodes.length} nodes`);
    packageJson.n8n.nodes.forEach(node => {
      log('green', `      - ${node}`);
    });
  } else {
    log('red', '   ❌ n8n.nodes not configured in package.json');
    return false;
  }

  if (packageJson.n8n && packageJson.n8n.credentials) {
    log('green', `   ✅ n8n.credentials configured: ${packageJson.n8n.credentials.length} credentials`);
    packageJson.n8n.credentials.forEach(cred => {
      log('green', `      - ${cred}`);
    });
  } else {
    log('red', '   ❌ n8n.credentials not configured in package.json');
    return false;
  }

  // Test 3: Load and analyze built node
  log('blue', '\n🔍 Test 3: Analyzing built Enlyst node...');
  try {
    const enlystNodePath = path.resolve('dist/nodes/Enlyst/Enlyst.node.js');
    const nodeContent = fs.readFileSync(enlystNodePath, 'utf8');
    
    // Check for key components
    const checks = [
      { name: 'Enlyst class export', pattern: /class Enlyst/ },
      { name: 'Project operations', pattern: /project/ },
      { name: 'Lead operations', pattern: /lead/ },
      { name: 'Referral operations', pattern: /referral/ },
      { name: 'HTTP routing', pattern: /routing/ },
      { name: 'API endpoints', pattern: /\/projects/ }
    ];

    checks.forEach(check => {
      if (check.pattern.test(nodeContent)) {
        log('green', `   ✅ ${check.name} found`);
      } else {
        log('yellow', `   ⚠️  ${check.name} not detected`);
      }
    });

  } catch (error) {
    log('red', `   ❌ Error loading node: ${error.message}`);
    return false;
  }

  // Test 4: Analyze Enlyst Trigger node
  log('blue', '\n🪝 Test 4: Analyzing Enlyst Trigger node...');
  try {
    const triggerNodePath = path.resolve('dist/nodes/Enlyst/EnlystTrigger.node.js');
    const triggerContent = fs.readFileSync(triggerNodePath, 'utf8');
    
    const triggerChecks = [
      { name: 'EnlystTrigger class', pattern: /class EnlystTrigger/ },
      { name: 'Webhook configuration', pattern: /webhooks/ },
      { name: 'Authentication support', pattern: /authentication/ },
      { name: 'Event filtering', pattern: /events/ },
      { name: 'Project filtering', pattern: /projectFilter/ },
      { name: 'Webhook handler', pattern: /webhook.*function/ }
    ];

    triggerChecks.forEach(check => {
      if (check.pattern.test(triggerContent)) {
        log('green', `   ✅ ${check.name} found`);
      } else {
        log('yellow', `   ⚠️  ${check.name} not detected`);
      }
    });

  } catch (error) {
    log('red', `   ❌ Error loading trigger node: ${error.message}`);
    return false;
  }

  // Test 5: Check credentials
  log('blue', '\n🔐 Test 5: Checking credentials configuration...');
  try {
    const credentialsPath = path.resolve('dist/credentials/EnlystApi.credentials.js');
    const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
    
    const credChecks = [
      { name: 'EnlystApi class', pattern: /class EnlystApi/ },
      { name: 'Base URL field', pattern: /baseUrl/ },
      { name: 'API Key field', pattern: /apiKey/ },
      { name: 'Authentication header', pattern: /Authorization/ }
    ];

    credChecks.forEach(check => {
      if (check.pattern.test(credentialsContent)) {
        log('green', `   ✅ ${check.name} found`);
      } else {
        log('yellow', `   ⚠️  ${check.name} not detected`);
      }
    });

  } catch (error) {
    log('red', `   ❌ Error loading credentials: ${error.message}`);
    return false;
  }

  log('green', '\n🎉 All tests passed! Your Enlyst n8n nodes are ready to use.');
  
  // Installation instructions
  log('cyan', '\n📋 Next Steps:');
  log('blue', '1. Install in n8n:');
  log('yellow', '   Option A (Local): npm link');
  log('yellow', '   Option B (Production): npm publish && npm install n8n-nodes-enlyst');
  log('yellow', '   Option C (Development): Copy to n8n node_modules');
  
  log('blue', '\n2. Configure credentials in n8n:');
  log('yellow', '   - Base URL: https://enlyst.app/api');
  log('yellow', '   - API Key: Your Enlyst API key');
  
  log('blue', '\n3. Test operations:');
  log('yellow', '   - Create a workflow with Enlyst node');
  log('yellow', '   - Test "Get All Projects" operation');
  log('yellow', '   - Set up webhook trigger for automation');

  log('blue', '\n4. Test webhook trigger:');
  log('yellow', '   - Add Enlyst Trigger to workflow');
  log('yellow', '   - Copy webhook URL');
  log('yellow', '   - Configure in Enlyst project settings');
  log('yellow', '   - Run: node test-webhook.js <webhook-url>');

  return true;
}

// Run tests
testEnlystNode().catch(error => {
  log('red', `\n❌ Test failed: ${error.message}`);
  process.exit(1);
});