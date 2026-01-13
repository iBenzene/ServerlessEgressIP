/**
 * Azure Functions v4 - Serverless Egress IP Detector
 * 
 * Source file - uses shared library from lib/ip-detector.js
 * Build with: npm run build:azure
 */
import { app } from '@azure/functions';
import { detectEgressIP } from '../../../lib/ip-detector.js';

app.http('detectEgressIP', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: '',
    handler: async (request, context) => {
        try {
            const result = await detectEgressIP('azure-functions');
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(result, null, 2)
            };
        } catch (error) {
            return {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Failed to detect egress IP',
                    message: error.message,
                    platform: 'azure-functions'
                })
            };
        }
    }
});
