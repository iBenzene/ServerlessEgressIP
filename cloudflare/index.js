/**
 * Cloudflare Worker - Serverless Egress IP Detector
 * 
 * Source file - uses shared library from lib/ip-detector.js
 * Build with: npm run build:cloudflare
 */
import { handleRequest } from '../lib/ip-detector.js';

export default {
    async fetch(request, env, ctx) {
        return handleRequest('cloudflare-worker');
    }
};
