/**
 * AWS Lambda - Serverless Egress IP Detector
 * 
 * Source file - uses shared library from lib/ip-detector.js
 * Build with: npm run build:aws
 */
import { detectEgressIP } from '../lib/ip-detector.js';

export const handler = async (event, context) => {
    try {
        const result = await detectEgressIP('aws-lambda');
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result, null, 2)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                error: 'Failed to detect egress IP',
                message: error.message,
                platform: 'aws-lambda'
            })
        };
    }
};
