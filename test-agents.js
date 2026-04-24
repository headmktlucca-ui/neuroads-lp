// Test script for NeuroAds agents
import { generateCreativeSuiteResult } from './src/app/actions/creative-suite';
import { analyzeTraffic } from './src/app/actions/ai-analysis';
import { analyzeLandingPage } from './src/app/actions/lp-diagnostic';

async function testAgents() {
  console.log('🧪 Testing NeuroAds Agents...\n');

  // Test 1: Creative Suite
  console.log('1. Testing Creative Suite...');
  try {
    const creativeResult = await generateCreativeSuiteResult('Test product for fitness coaching');
    console.log('✅ Creative Suite:', creativeResult.success ? 'PASS' : 'FAIL');
    if (!creativeResult.success) console.log('   Error:', creativeResult.error);
  } catch (error) {
    console.log('❌ Creative Suite: FAIL');
    console.log('   Error:', error);
  }

  // Test 2: Traffic Analysis
  console.log('\n2. Testing Traffic Analysis...');
  try {
    const trafficData = {
      impressions: 10000,
      clicks: 500,
      conversions: 25,
      cost: 1000,
      revenue: 2500
    };
    const trafficResult = await analyzeTraffic(trafficData);
    console.log('✅ Traffic Analysis:', trafficResult.success ? 'PASS' : 'FAIL');
    if (!trafficResult.success) console.log('   Error:', trafficResult.error);
  } catch (error) {
    console.log('❌ Traffic Analysis: FAIL');
    console.log('   Error:', error);
  }

  // Test 3: LP Diagnostic
  console.log('\n3. Testing LP Diagnostic...');
  try {
    const lpResult = await analyzeLandingPage('https://example.com');
    console.log('✅ LP Diagnostic:', lpResult.success ? 'PASS' : 'FAIL');
    if (!lpResult.success) console.log('   Error:', lpResult.error);
  } catch (error) {
    console.log('❌ LP Diagnostic: FAIL');
    console.log('   Error:', error);
  }

  console.log('\n🏁 Agent testing completed.');
}

// Run tests
testAgents().catch(console.error);