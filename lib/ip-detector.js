/**
 * Serverless Egress IP Detector - Core Library
 * 
 * This is the shared library that can be used locally or bundled with platform adapters.
 * For cloud deployment, each platform file should inline this logic or use a bundler.
 */

// IP detection endpoints with fallback
const IP_ENDPOINTS = {
    ipv4: [
        'https://api.ipify.org?format=json',
        'https://ipv4.icanhazip.com'
    ],
    ipv6: [
        'https://api6.ipify.org?format=json',
        'https://ipv6.icanhazip.com'
    ]
};

/**
 * Check if a string is a valid IPv4 address
 * @param {string} ip - The IP address to check
 * @returns {boolean}
 */
function isIPv4(ip) {
    if (!ip) return false;
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255 && part === String(num);
    });
}

/**
 * Check if a string is a valid IPv6 address
 * @param {string} ip - The IP address to check
 * @returns {boolean}
 */
function isIPv6(ip) {
    if (!ip) return false;
    // Simple check: contains colon and no dots (not IPv4)
    return ip.includes(':') && !ip.includes('.');
}

/**
 * Fetch IP from a single endpoint
 * @param {string} url - The endpoint URL
 * @param {number} timeout - Request timeout in ms
 * @returns {Promise<string|null>} The IP address or null on failure
 */
async function fetchIPFromEndpoint(url, timeout = 5000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'ServerlessEgressIP/1.0' }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return null;
        }

        const text = await response.text();

        // Handle JSON response (ipify format: {"ip": "x.x.x.x"})
        if (url.includes('format=json')) {
            try {
                const json = JSON.parse(text);
                return json.ip || null;
            } catch {
                return null;
            }
        }

        // Handle plain text response (icanhazip format)
        return text.trim() || null;
    } catch (error) {
        // Timeout, network error, or abort - return null (fail gracefully)
        return null;
    }
}

/**
 * Fetch IP with fallback endpoints
 * Tries each endpoint in order until one succeeds
 * @param {string[]} endpoints - Array of endpoint URLs to try
 * @returns {Promise<string|null>} The IP address or null if all fail
 */
async function fetchIPWithFallback(endpoints) {
    for (const endpoint of endpoints) {
        const ip = await fetchIPFromEndpoint(endpoint);
        if (ip) {
            return ip;
        }
    }
    return null;
}

/**
 * Detect egress IP addresses (both IPv4 and IPv6)
 * 
 * If one protocol fails (e.g., no IPv6 connectivity), that field will be null.
 * The function never throws - it always returns a valid result object.
 * 
 * @param {string} platform - The platform identifier
 * @returns {Promise<Object>} Detection result object
 */
export async function detectEgressIP(platform = 'unknown') {
    const startTime = Date.now();

    // Fetch IPv4 and IPv6 in parallel for speed
    const [ipv4Raw, ipv6Raw] = await Promise.all([
        fetchIPWithFallback(IP_ENDPOINTS.ipv4),
        fetchIPWithFallback(IP_ENDPOINTS.ipv6)
    ]);

    // Validate IP formats - some APIs may return wrong type
    const ipv4 = isIPv4(ipv4Raw) ? ipv4Raw : null;
    const ipv6 = isIPv6(ipv6Raw) ? ipv6Raw : null;

    const duration = Date.now() - startTime;

    return {
        ipv4: ipv4,      // null if detection failed or wrong format
        ipv6: ipv6,      // null if detection failed or wrong format
        timestamp: new Date().toISOString(),
        platform: platform,
        detectionTimeMs: duration
    };
}

/**
 * Create HTTP response with JSON payload (for Fetch API compatible platforms)
 * @param {Object} data - The response data
 * @param {number} status - HTTP status code
 * @returns {Response} Fetch API Response object
 */
export function createJsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data, null, 2), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*'
        }
    });
}

/**
 * Main handler for platforms that support fetch Response API
 * @param {string} platform - The platform identifier
 * @returns {Promise<Response>} HTTP Response
 */
export async function handleRequest(platform) {
    try {
        const result = await detectEgressIP(platform);
        return createJsonResponse(result);
    } catch (error) {
        return createJsonResponse({
            error: 'Failed to detect egress IP',
            message: error.message,
            platform: platform
        }, 500);
    }
}

export default { detectEgressIP, createJsonResponse, handleRequest };
