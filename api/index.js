// Vercel Serverless Function Entrypoint
// Bridges Vercel serverless requests to the SevaSetu Express application
const app = require('../server');

module.exports = (req, res) => {
    // If Vercel rewrote the URL to the destination path (/api, /api/, or /api/index.js),
    // restore the client's actual requested API path so Express routes match correctly.
    const originalPath = req.headers['x-forwarded-uri'] || 
                         req.headers['x-vercel-matched-path'] || 
                         req.headers['x-matched-path'] || 
                         req.headers['x-now-route-matches'];

    if (originalPath && originalPath.startsWith('/api') && 
        (req.url === '/api' || req.url === '/api/' || req.url === '/api/index.js' || req.url === '/api/index')) {
        req.url = originalPath;
    }

    return app(req, res);
};
