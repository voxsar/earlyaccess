/**
 * Health check routes
 */
const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'earlyaccess-backend',
    version: '1.0.0',
  });
});

/**
 * GET /api/health/ready
 * Readiness check endpoint
 */
router.get('/ready', (req, res) => {
  // Check if required environment variables are set
  const requiredEnvVars = [
    'SHOPIFY_API_KEY',
    'SHOPIFY_API_SECRET',
    'SHOPIFY_SHOP_DOMAIN',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    return res.status(503).json({
      success: false,
      status: 'not_ready',
      message: 'Missing required environment variables',
      missing: missingVars,
    });
  }

  res.status(200).json({
    success: true,
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
