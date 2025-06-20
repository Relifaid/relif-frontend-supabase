#!/usr/bin/env node

/**
 * Test script to verify Supabase migration setup
 * Run with: node scripts/test-supabase-connection.js
 */

require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Migration Setup...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  function logTest(name, status, message) {
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${name}: ${message}`);
    results[status === 'pass' ? 'passed' : status === 'fail' ? 'failed' : 'warnings']++;
  }
  
  // 1. Test Environment Variables
  console.log('1️⃣ Testing Environment Variables...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
    logTest('Supabase URL', 'pass', supabaseUrl);
  } else {
    logTest('Supabase URL', 'fail', 'Missing or invalid NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (supabaseKey && supabaseKey.length > 20) {
    logTest('Supabase Key', 'pass', 'Present (length: ' + supabaseKey.length + ')');
  } else {
    logTest('Supabase Key', 'fail', 'Missing or invalid NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  
  // 2. Test Dependencies
  console.log('\n2️⃣ Testing Dependencies...');
  try {
    require('@supabase/supabase-js');
    logTest('Supabase Client', 'pass', 'Package installed');
  } catch (error) {
    logTest('Supabase Client', 'fail', 'Package not found. Run: npm install @supabase/supabase-js');
  }
  
  // 3. Test Configuration Files
  console.log('\n3️⃣ Testing Configuration Files...');
  const fs = require('fs');
  const path = require('path');
  
  const configFiles = [
    'src/config/supabase.ts',
    'src/lib/supabase-client.ts',
    'SUPABASE_MIGRATION_GUIDE.md'
  ];
  
  configFiles.forEach(file => {
    if (fs.existsSync(path.join(process.cwd(), file))) {
      logTest('Config File', 'pass', file);
    } else {
      logTest('Config File', 'fail', `Missing: ${file}`);
    }
  });
  
  // 4. Test Updated Repository Files
  console.log('\n4️⃣ Testing Updated Repository Files...');
  const repoFiles = [
    'src/repository/auth.repository.ts',
    'src/repository/organization.repository.ts',
    'src/repository/beneficiary.repository.ts'
  ];
  
  repoFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('supabase-client')) {
        logTest('Repository Migration', 'pass', file);
      } else {
        logTest('Repository Migration', 'warn', `${file} not migrated yet`);
      }
    } else {
      logTest('Repository Migration', 'fail', `Missing: ${file}`);
    }
  });
  
  // 5. Test Network Connection (if credentials are provided)
  if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
    console.log('\n5️⃣ Testing Network Connection...');
    try {
      const response = await fetch(supabaseUrl + '/health');
      if (response.ok) {
        logTest('Network Connection', 'pass', 'Supabase reachable');
      } else {
        logTest('Network Connection', 'warn', `HTTP ${response.status}`);
      }
    } catch (error) {
      logTest('Network Connection', 'warn', 'Could not reach Supabase: ' + error.message);
    }
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`❌ Failed: ${results.failed}`);
  
  if (results.failed === 0) {
    console.log('\n🎉 Setup looks good! Next steps:');
    console.log('1. Add your real Supabase credentials to .env.local');
    console.log('2. Test authentication in your app');
    console.log('3. Check the migration guide: SUPABASE_MIGRATION_GUIDE.md');
  } else {
    console.log('\n🚨 Issues found. Please fix the failed tests above.');
  }
}

// Run the test
testSupabaseConnection().catch(console.error); 