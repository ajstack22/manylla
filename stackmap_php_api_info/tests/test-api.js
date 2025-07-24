/**
 * StackMap Sync API Test Script (JavaScript/Node.js)
 * 
 * Usage: node test-api.js [api-base-url]
 * 
 * Requires: npm install node-fetch
 */

const fetch = require('node-fetch');

// Configuration
const apiBase = process.argv[2] || 'http://localhost/api/sync';
const testSyncId = generateHexId();
const testDeviceId = generateHexId();

// Colors for output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    reset: '\x1b[0m'
};

// Helper functions
function generateHexId() {
    return [...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function testPassed(message) {
    console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function testFailed(message, error) {
    console.log(`${colors.red}✗ ${message}: ${error}${colors.reset}`);
}

function testWarning(message) {
    console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

async function makeRequest(endpoint, options = {}) {
    try {
        const url = `${apiBase}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        const data = await response.json().catch(() => null);
        
        return {
            ok: response.ok,
            status: response.status,
            headers: response.headers,
            data
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            error: error.message
        };
    }
}

// Test data
const testData = {
    test: 'data',
    timestamp: Date.now()
};

const testBlob = Buffer.from(JSON.stringify(testData)).toString('base64');

// Main test function
async function runTests() {
    console.log('StackMap Sync API Test Suite (JavaScript)');
    console.log(`API Base: ${apiBase}`);
    console.log('=====================================\n');
    
    // Test 1: Health Check
    console.log('1. Testing Health Endpoint');
    const healthResponse = await makeRequest('/health.php');
    
    if (healthResponse.ok && healthResponse.data?.status === 'healthy') {
        testPassed('Health check endpoint working');
        testPassed(`Database: ${healthResponse.data.database.status}`);
    } else {
        testFailed('Health check', `Status: ${healthResponse.status}`);
    }
    console.log();
    
    // Test 2: Create Sync Group
    console.log('2. Testing Create Endpoint');
    const createResponse = await makeRequest('/create.php', {
        method: 'POST',
        body: JSON.stringify({
            sync_id: testSyncId,
            encrypted_blob: testBlob,
            device_id: testDeviceId,
            device_name: 'Test Device JS'
        })
    });
    
    if (createResponse.ok && createResponse.data?.success) {
        testPassed('Create sync group successful');
        testPassed(`Version: ${createResponse.data.version}`);
    } else {
        testFailed('Create sync group', `Status: ${createResponse.status}`);
        console.log('Response:', createResponse.data);
    }
    console.log();
    
    // Test 3: Pull Data
    console.log('3. Testing Pull Endpoint');
    const pullResponse = await makeRequest(`/pull.php?sync_id=${testSyncId}&device_id=${testDeviceId}`);
    
    if (pullResponse.ok && pullResponse.data?.encrypted_blob === testBlob) {
        testPassed('Pull data successful');
        testPassed('Data integrity verified');
    } else {
        testFailed('Pull data', `Status: ${pullResponse.status}`);
    }
    console.log();
    
    // Test 4: Push Update
    console.log('4. Testing Push Endpoint');
    const newData = {
        test: 'updated',
        timestamp: Date.now()
    };
    const newBlob = Buffer.from(JSON.stringify(newData)).toString('base64');
    
    const pushResponse = await makeRequest('/push.php', {
        method: 'POST',
        body: JSON.stringify({
            sync_id: testSyncId,
            device_id: testDeviceId,
            encrypted_blob: newBlob,
            sync_type: 'full'
        })
    });
    
    if (pushResponse.ok && pushResponse.data?.version === 2) {
        testPassed('Push update successful');
        testPassed(`Version incremented to ${pushResponse.data.version}`);
    } else {
        testFailed('Push update', `Status: ${pushResponse.status}`);
    }
    console.log();
    
    // Test 5: Input Validation
    console.log('5. Testing Input Validation');
    
    // Invalid sync ID
    const invalidSyncResponse = await makeRequest('/pull.php?sync_id=invalid&device_id=' + testDeviceId);
    if (invalidSyncResponse.status === 400) {
        testPassed('Invalid sync ID rejected');
    } else {
        testFailed('Sync ID validation', `Expected 400, got ${invalidSyncResponse.status}`);
    }
    
    // Invalid blob
    const invalidBlobResponse = await makeRequest('/create.php', {
        method: 'POST',
        body: JSON.stringify({
            sync_id: generateHexId(),
            device_id: generateHexId(),
            encrypted_blob: 'not-valid-base64!@#$'
        })
    });
    
    if (invalidBlobResponse.status === 400) {
        testPassed('Invalid base64 blob rejected');
    } else {
        testFailed('Blob validation', `Expected 400, got ${invalidBlobResponse.status}`);
    }
    console.log();
    
    // Test 6: Rate Limiting
    console.log('6. Testing Rate Limiting');
    testWarning('Making 35 rapid requests...');
    
    let rateLimitHit = false;
    for (let i = 1; i <= 35; i++) {
        const response = await makeRequest('/health.php');
        if (response.status === 429) {
            rateLimitHit = true;
            testPassed(`Rate limit enforced after ${i} requests`);
            
            // Check headers
            const remaining = response.headers.get('X-RateLimit-Remaining');
            if (remaining !== null) {
                testPassed('Rate limit headers present');
            }
            break;
        }
    }
    
    if (!rateLimitHit) {
        testWarning('Rate limiting might not be working');
    }
    console.log();
    
    // Test 7: Delete Sync Data
    console.log('7. Testing Delete Endpoint');
    const deleteResponse = await makeRequest('/delete.php', {
        method: 'POST',
        body: JSON.stringify({
            sync_id: testSyncId,
            device_id: testDeviceId
        })
    });
    
    if (deleteResponse.ok && deleteResponse.data?.deleted_count > 0) {
        testPassed('Delete sync data successful');
        
        // Verify deletion
        const verifyResponse = await makeRequest(`/pull.php?sync_id=${testSyncId}&device_id=${testDeviceId}`);
        if (verifyResponse.status === 404) {
            testPassed('Data confirmed deleted');
        } else {
            testFailed('Verify deletion', 'Data still exists');
        }
    } else {
        testFailed('Delete sync data', `Status: ${deleteResponse.status}`);
    }
    console.log();
    
    // Test 8: Error Handling
    console.log('8. Testing Error Handling');
    
    // Non-existent sync
    const notFoundResponse = await makeRequest('/pull.php?sync_id=' + generateHexId() + '&device_id=' + generateHexId());
    if (notFoundResponse.status === 404) {
        testPassed('Non-existent sync returns 404');
    } else {
        testFailed('404 handling', `Expected 404, got ${notFoundResponse.status}`);
    }
    
    // Wrong method
    const wrongMethodResponse = await makeRequest('/create.php');
    if (wrongMethodResponse.status === 405) {
        testPassed('Wrong HTTP method returns 405');
    } else {
        testFailed('Method validation', `Expected 405, got ${wrongMethodResponse.status}`);
    }
    console.log();
    
    // Summary
    console.log('=====================================');
    console.log('Test Complete!');
    console.log('\nMake sure to also test:');
    console.log('- HTTPS in production');
    console.log('- CORS with actual browser requests');
    console.log('- Large payload handling');
    console.log('- Concurrent sync scenarios');
}

// Run tests
runTests().catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
});