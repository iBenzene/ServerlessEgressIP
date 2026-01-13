/**
 * GCP Cloud Functions - Serverless Egress IP Detector
 * 
 * Source file - uses shared library from lib/ip-detector.js
 * Build with: npm run build:gcp
 */
import { detectEgressIP } from '../lib/ip-detector.js';

/**
 * HTTP Cloud Function entry point
 * @param {Object} req - Express-like request object
 * @param {Object} res - Express-like response object
 */
export const detectEgressIPHandler = async (req, res) => {
    try {
        const result = await detectEgressIP('gcp-cloud-functions');
        res.set('Content-Type', 'application/json');
        res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.set('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to detect egress IP',
            message: error.message,
            platform: 'gcp-cloud-functions'
        });
    }
};

// Export for Cloud Functions
export { detectEgressIPHandler as detectEgressIP };
