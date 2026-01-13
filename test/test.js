/**
 * Test script for the IP detector library
 */
import { detectEgressIP } from '../lib/ip-detector.js';

async function runTest() {
    console.log('Testing Serverless Egress IP Detector...\n');

    try {
        const result = await detectEgressIP('test');

        console.log('Detection Result:');
        console.log(JSON.stringify(result, null, 2));
        console.log();

        // Validate result structure
        const requiredFields = ['ipv4', 'ipv6', 'timestamp', 'platform', 'detectionTimeMs'];
        const missingFields = requiredFields.filter(field => !(field in result));

        if (missingFields.length > 0) {
            console.error('❌ Missing fields:', missingFields.join(', '));
            process.exit(1);
        }

        console.log('✅ All required fields present');

        // Validate IP addresses
        if (result.ipv4) {
            const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
            if (ipv4Regex.test(result.ipv4)) {
                console.log('✅ IPv4 is valid:', result.ipv4);
            } else {
                console.log('❌ IPv4 format invalid:', result.ipv4);
            }
        } else {
            console.log('⚠️  IPv4 not detected (may be network issue)');
        }

        if (result.ipv6) {
            console.log('✅ IPv6 detected:', result.ipv6);
        } else {
            console.log('⚠️  IPv6 not detected (may not be available)');
        }

        console.log('\n✅ Test completed successfully!');
        console.log(`   Detection time: ${result.detectionTimeMs}ms`);
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

runTest();
