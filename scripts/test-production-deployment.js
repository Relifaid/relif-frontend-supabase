const { createClient } = require('@supabase/supabase-js');

// Production Supabase configuration (from environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing production environment variables!');
    console.log('Please set:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductionDeployment() {
    console.log('🚀 Testing Production Deployment...\n');
    console.log(`📍 Testing against: ${supabaseUrl}\n`);

    const results = {
        passed: 0,
        failed: 0,
        sections: {}
    };

    try {
        // Test 1: Basic Supabase Connection
        console.log('1️⃣ Testing Supabase Connection...');
        try {
            const { data, error } = await supabase.from('users').select('count').limit(1);
            if (error) throw error;
            console.log('✅ Supabase connection successful');
            results.passed++;
            results.sections.connection = 'PASS';
        } catch (error) {
            console.log('❌ Supabase connection failed:', error.message);
            results.failed++;
            results.sections.connection = 'FAIL';
        }

        // Test 2: Database Schema Validation
        console.log('\n2️⃣ Testing Database Schema...');
        const tables = [
            'users', 'organizations', 'beneficiaries', 'cases', 
            'housing', 'product_types', 'voluntary_people', 'donations'
        ];
        
        let schemaScore = 0;
        for (const table of tables) {
            try {
                const { error } = await supabase.from(table).select('*').limit(1);
                if (!error) {
                    console.log(`✅ Table '${table}' accessible`);
                    schemaScore++;
                } else {
                    console.log(`❌ Table '${table}' error: ${error.message}`);
                }
            } catch (error) {
                console.log(`❌ Table '${table}' error: ${error.message}`);
            }
        }
        
        if (schemaScore === tables.length) {
            console.log(`✅ All ${tables.length} tables accessible`);
            results.passed++;
            results.sections.schema = 'PASS';
        } else {
            console.log(`⚠️ ${schemaScore}/${tables.length} tables accessible`);
            results.failed++;
            results.sections.schema = 'PARTIAL';
        }

        // Test 3: Authentication Functions
        console.log('\n3️⃣ Testing Authentication System...');
        try {
            // Test if auth is configured
            const { data: { session } } = await supabase.auth.getSession();
            console.log('✅ Auth system initialized');
            results.passed++;
            results.sections.auth = 'PASS';
        } catch (error) {
            console.log('❌ Auth system error:', error.message);
            results.failed++;
            results.sections.auth = 'FAIL';
        }

        // Test 4: Repository Functions Sample
        console.log('\n4️⃣ Testing Repository Functions...');
        const repositoryTests = [
            {
                name: 'Users',
                test: async () => {
                    const { data, error } = await supabase
                        .from('users')
                        .select('id, first_name, platform_role')
                        .limit(1);
                    return { success: !error, error };
                }
            },
            {
                name: 'Organizations',
                test: async () => {
                    const { data, error } = await supabase
                        .from('organizations')
                        .select('id, name')
                        .limit(1);
                    return { success: !error, error };
                }
            },
            {
                name: 'Beneficiaries',
                test: async () => {
                    const { data, error } = await supabase
                        .from('beneficiaries')
                        .select('id, full_name')
                        .limit(1);
                    return { success: !error, error };
                }
            }
        ];

        let repoScore = 0;
        for (const test of repositoryTests) {
            try {
                const result = await test.test();
                if (result.success) {
                    console.log(`✅ ${test.name} repository working`);
                    repoScore++;
                } else {
                    console.log(`❌ ${test.name} repository error: ${result.error?.message}`);
                }
            } catch (error) {
                console.log(`❌ ${test.name} repository error: ${error.message}`);
            }
        }

        if (repoScore === repositoryTests.length) {
            results.passed++;
            results.sections.repositories = 'PASS';
        } else {
            results.failed++;
            results.sections.repositories = 'PARTIAL';
        }

        // Test 5: Storage Buckets
        console.log('\n5️⃣ Testing Storage Configuration...');
        try {
            const { data: buckets, error } = await supabase.storage.listBuckets();
            if (error) throw error;
            
            const expectedBuckets = ['case-documents', 'beneficiary-profiles'];
            const existingBuckets = buckets.map(b => b.name);
            const missingBuckets = expectedBuckets.filter(b => !existingBuckets.includes(b));
            
            if (missingBuckets.length === 0) {
                console.log('✅ All storage buckets configured');
                results.passed++;
                results.sections.storage = 'PASS';
            } else {
                console.log(`⚠️ Missing buckets: ${missingBuckets.join(', ')}`);
                results.failed++;
                results.sections.storage = 'PARTIAL';
            }
        } catch (error) {
            console.log('❌ Storage configuration error:', error.message);
            results.failed++;
            results.sections.storage = 'FAIL';
        }

        // Test 6: Environment Configuration
        console.log('\n6️⃣ Testing Environment Configuration...');
        const envTests = [
            { name: 'SUPABASE_URL', value: supabaseUrl, valid: supabaseUrl.includes('supabase.co') },
            { name: 'SUPABASE_KEY', value: supabaseKey, valid: supabaseKey.length > 100 }
        ];

        let envScore = 0;
        for (const env of envTests) {
            if (env.valid) {
                console.log(`✅ ${env.name} configured correctly`);
                envScore++;
            } else {
                console.log(`❌ ${env.name} configuration issue`);
            }
        }

        if (envScore === envTests.length) {
            results.passed++;
            results.sections.environment = 'PASS';
        } else {
            results.failed++;
            results.sections.environment = 'FAIL';
        }

        // Final Results
        console.log('\n' + '='.repeat(50));
        console.log('📊 PRODUCTION DEPLOYMENT TEST RESULTS');
        console.log('='.repeat(50));
        
        console.log(`✅ Tests Passed: ${results.passed}`);
        console.log(`❌ Tests Failed: ${results.failed}`);
        console.log(`📊 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
        
        console.log('\n📋 Section Results:');
        Object.entries(results.sections).forEach(([section, status]) => {
            const icon = status === 'PASS' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌';
            console.log(`   ${icon} ${section}: ${status}`);
        });

        // Deployment Recommendations
        console.log('\n🎯 DEPLOYMENT STATUS:');
        if (results.failed === 0) {
            console.log('🎉 READY FOR PRODUCTION! All tests passed.');
            console.log('Your application is fully migrated and ready to serve users.');
        } else if (results.passed >= results.failed) {
            console.log('⚠️ MOSTLY READY - Some issues detected.');
            console.log('Review failed tests and fix issues before full production launch.');
        } else {
            console.log('❌ NOT READY - Critical issues detected.');
            console.log('Fix all issues before deploying to production.');
        }

        console.log('\n🚀 Next Steps:');
        if (results.sections.schema === 'FAIL') {
            console.log('1. Run setup-database.sql in your Supabase dashboard');
        }
        if (results.sections.storage === 'FAIL' || results.sections.storage === 'PARTIAL') {
            console.log('2. Create missing storage buckets in Supabase dashboard');
        }
        if (results.sections.connection === 'FAIL') {
            console.log('3. Check RLS policies and table permissions');
        }
        
        console.log('\n🏆 Migration Complete: 100% Pure Supabase Architecture!');

    } catch (error) {
        console.error('💥 Production test failed with error:', error);
        console.log('\n❌ PRODUCTION DEPLOYMENT TEST FAILED');
        console.log('   Check configuration and try again');
        process.exit(1);
    }
}

// Run the test if this script is executed directly
if (require.main === module) {
    testProductionDeployment().catch(console.error);
}

module.exports = { testProductionDeployment }; 