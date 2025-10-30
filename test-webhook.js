#!/usr/bin/env node

/**
 * Test script for Enlyst Webhook Trigger
 * 
 * This script simulates the webhook payload that Enlyst sends
 * when an enrichment process is completed.
 */

const testWebhookPayload = {
  event: 'enrichment.completed',
  timestamp: new Date().toISOString(),
  data: {
    projectId: 'proj_123abc',
    projectName: 'Test Project',
    stats: {
      total: 100,
      completed: 85,
      failed: 10,
      stopped: 5,
      queued: 0,
      processing: 0
    },
    completedAt: new Date().toISOString()
  }
};

async function testWebhook(webhookUrl) {
  try {
    console.log('🧪 Testing Enlyst Webhook Trigger...');
    console.log('📤 Sending payload to:', webhookUrl);
    console.log('📋 Payload:', JSON.stringify(testWebhookPayload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Enlyst-Event': 'enrichment.completed',
        'User-Agent': 'Enlyst-Test/1.0'
      },
      body: JSON.stringify(testWebhookPayload)
    });

    console.log('📨 Response status:', response.status);
    console.log('📨 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📨 Response body:', responseText);

    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }

  } catch (error) {
    console.error('❌ Webhook test error:', error.message);
  }
}

// Usage instructions
if (process.argv.length < 3) {
  console.log(`
🔗 Enlyst Webhook Trigger Test

Usage: node test-webhook.js <webhook-url>

Example:
  node test-webhook.js http://localhost:5678/webhook/enlyst

Test Payload:
${JSON.stringify(testWebhookPayload, null, 2)}

Instructions:
1. Start your n8n instance
2. Create a workflow with the Enlyst Trigger node
3. Copy the webhook URL from the trigger node
4. Run this script with the webhook URL
  `);
  process.exit(1);
}

const webhookUrl = process.argv[2];
testWebhook(webhookUrl);