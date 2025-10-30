/**
 * Session Storage Service
 * Handles persistent storage of Shopify access tokens and session data
 * Uses file-based storage for simplicity (can be upgraded to database later)
 */

const fs = require('fs').promises;
const path = require('path');

const STORAGE_DIR = path.join(__dirname, '../../.sessions');
const STORAGE_FILE = path.join(STORAGE_DIR, 'sessions.json');

/**
 * Initialize storage directory
 */
async function initStorage() {
	try {
		await fs.mkdir(STORAGE_DIR, { recursive: true });
		// Check if file exists, create if not
		try {
			await fs.access(STORAGE_FILE);
		} catch {
			await fs.writeFile(STORAGE_FILE, JSON.stringify({}), 'utf8');
		}
	} catch (error) {
		console.error('Error initializing session storage:', error);
	}
}

/**
 * Load all sessions from storage
 */
async function loadSessions() {
	try {
		await initStorage();
		const data = await fs.readFile(STORAGE_FILE, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Error loading sessions:', error);
		return {};
	}
}

/**
 * Save all sessions to storage
 */
async function saveSessions(sessions) {
	try {
		await initStorage();
		await fs.writeFile(STORAGE_FILE, JSON.stringify(sessions, null, 2), 'utf8');
	} catch (error) {
		console.error('Error saving sessions:', error);
		throw error;
	}
}

/**
 * Store a session for a shop
 * @param {string} shop - Shop domain (e.g., "example.myshopify.com")
 * @param {Object} sessionData - Session data including access token
 */
async function storeSession(shop, sessionData) {
	const sessions = await loadSessions();
	sessions[shop] = {
		...sessionData,
		updatedAt: new Date().toISOString(),
	};
	await saveSessions(sessions);
	console.log(`✅ Session stored for shop: ${shop}`);
}

/**
 * Get a session for a shop
 * @param {string} shop - Shop domain
 * @returns {Object|null} Session data or null if not found
 */
async function getSession(shop) {
	const sessions = await loadSessions();
	return sessions[shop] || null;
}

/**
 * Delete a session for a shop
 * @param {string} shop - Shop domain
 */
async function deleteSession(shop) {
	const sessions = await loadSessions();
	delete sessions[shop];
	await saveSessions(sessions);
	console.log(`🗑️  Session deleted for shop: ${shop}`);
}

/**
 * Get all stored sessions
 * @returns {Object} All sessions
 */
async function getAllSessions() {
	return await loadSessions();
}

module.exports = {
	storeSession,
	getSession,
	deleteSession,
	getAllSessions,
};
