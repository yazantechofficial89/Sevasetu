// Vercel Serverless Function Entrypoint
// Bridges Vercel serverless requests to the SevaSetu Express application
const app = require('../server');

module.exports = (req, res) => {
    return app(req, res);
};
