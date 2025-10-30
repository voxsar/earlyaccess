/**
 * Backend API Server for Early Access + Wishlist Shopify App
 * Handles all wishlist operations and Shopify API interactions
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const wishlistRoutes = require('./routes/wishlist');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
	origin: function (origin, callback) {
		const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
		if (!origin || allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	optionsSuccessStatus: 200,
};

// Cookie parser (must be before session middleware)
// Used for signed cookies in OAuth flow for additional nonce validation
const cookieSecret = process.env.SESSION_SECRET || 'your-secret-key';
app.use(cookieParser(cookieSecret));

// Session configuration
// CSRF Protection: OAuth endpoints use nonce validation (state parameter)
// which is stored in both session and signed cookies for double verification
app.use(session({
	secret: cookieSecret,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}));

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
	next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		error: {
			code: 'NOT_FOUND',
			message: 'Endpoint not found',
		},
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Backend API server running on port ${PORT}`);
	console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log(`🏪 Shopify Store: ${process.env.SHOPIFY_SHOP_DOMAIN || 'not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM signal received: closing HTTP server');
	app.close(() => {
		console.log('HTTP server closed');
	});
});

module.exports = app;
