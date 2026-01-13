/**
 * Vercel Serverless Function
 * Detects egress IP addresses
 */
import { detectEgressIP } from '../lib/ip-detector.js';

export default async function handler(req, res) {
    try {
        const result = await detectEgressIP('vercel');

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to detect egress IP',
            message: error.message,
            platform: 'vercel'
        });
    }
}
