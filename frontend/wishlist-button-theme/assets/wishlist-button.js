/**
 * Wishlist Button JavaScript
 * Handles wishlist add/remove functionality with customer metafields
 */

(function () {
	'use strict';

	// Configuration
	const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';
	const STORAGE_KEY = 'wishlist_products';

	class WishlistButton {
		constructor(buttonElement) {
			this.button = buttonElement;
			this.productId = this.button.dataset.productId;
			this.productHandle = this.button.dataset.productHandle;
			this.customerId = this.button.dataset.customerId;
			this.textElement = this.button.querySelector('[data-wishlist-text]');
			this.iconElement = this.button.querySelector('[data-wishlist-icon]');

			this.init();
		}

		init() {
			this.loadWishlistState();
			this.attachEventListeners();
		}

		attachEventListeners() {
			this.button.addEventListener('click', (e) => {
				e.preventDefault();
				this.toggleWishlist();
			});
		}

		async loadWishlistState() {
			try {
				// Check if product is in wishlist
				const isInWishlist = await this.checkWishlistStatus();
				this.updateButtonState(isInWishlist);
			} catch (error) {
				console.error('Error loading wishlist state:', error);
			}
		}

		async checkWishlistStatus() {
			// First check local storage for quick UI update
			const localWishlist = this.getLocalWishlist();
			if (localWishlist.includes(this.productId)) {
				return true;
			}

			// Then verify with server (metafields)
			// In a real implementation, this would call your app's API
			return false;
		}

		async toggleWishlist() {
			this.setLoadingState(true);

			try {
				const isInWishlist = this.button.classList.contains('wishlist-button--added');

				if (isInWishlist) {
					await this.removeFromWishlist();
				} else {
					await this.addToWishlist();
				}
			} catch (error) {
				this.showToast('An error occurred. Please try again.', 'error');
				console.error('Wishlist error:', error);
			} finally {
				this.setLoadingState(false);
			}
		}

		async addToWishlist() {
			// Update local storage immediately for better UX
			this.addToLocalWishlist(this.productId);

			// Update UI
			this.updateButtonState(true);
			this.showToast('Added to wishlist!', 'success');

			// Make API call to backend
			try {
				const response = await fetch(`${BACKEND_API_URL}/api/wishlist/add`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						customerId: this.customerId,
						productId: this.productId,
						productHandle: this.productHandle,
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to add to wishlist');
				}

				// Dispatch custom event for other scripts to listen to
				this.dispatchWishlistEvent('added', this.productId);
			} catch (error) {
				// If API call fails, revert the UI changes
				this.removeFromLocalWishlist(this.productId);
				this.updateButtonState(false);
				this.showToast('Failed to add to wishlist', 'error');
				throw error;
			}
		}

		async removeFromWishlist() {
			// Update local storage immediately
			this.removeFromLocalWishlist(this.productId);

			// Update UI
			this.updateButtonState(false);
			this.showToast('Removed from wishlist', 'success');

			// Make API call to backend
			try {
				const response = await fetch(`${BACKEND_API_URL}/api/wishlist/remove`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						customerId: this.customerId,
						productId: this.productId,
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to remove from wishlist');
				}

				// Dispatch custom event
				this.dispatchWishlistEvent('removed', this.productId);
			} catch (error) {
				// If API call fails, revert the UI changes
				this.addToLocalWishlist(this.productId);
				this.updateButtonState(true);
				this.showToast('Failed to remove from wishlist', 'error');
				throw error;
			}
		}

		updateButtonState(isInWishlist) {
			const settings = this.getBlockSettings();

			if (isInWishlist) {
				this.button.classList.add('wishlist-button--added');
				if (this.textElement) {
					this.textElement.textContent = settings.buttonTextAdded || 'Added to Wishlist';
				}
				this.button.setAttribute('aria-label', 'Remove from wishlist');
			} else {
				this.button.classList.remove('wishlist-button--added');
				if (this.textElement) {
					this.textElement.textContent = settings.buttonText || 'Add to Wishlist';
				}
				this.button.setAttribute('aria-label', 'Add to wishlist');
			}
		}

		setLoadingState(isLoading) {
			if (isLoading) {
				this.button.classList.add('wishlist-button--loading');
				this.button.disabled = true;
			} else {
				this.button.classList.remove('wishlist-button--loading');
				this.button.disabled = false;
			}
		}

		showToast(message, type = 'success') {
			// Remove existing toasts
			document.querySelectorAll('.wishlist-toast').forEach(toast => toast.remove());

			const toast = document.createElement('div');
			toast.className = `wishlist-toast wishlist-toast--${type}`;
			toast.textContent = message;
			document.body.appendChild(toast);

			// Auto-remove after 3 seconds
			setTimeout(() => {
				toast.style.opacity = '0';
				setTimeout(() => toast.remove(), 300);
			}, 3000);
		}

		getLocalWishlist() {
			try {
				const wishlist = localStorage.getItem(STORAGE_KEY);
				return wishlist ? JSON.parse(wishlist) : [];
			} catch (error) {
				console.error('Error reading wishlist from localStorage:', error);
				return [];
			}
		}

		addToLocalWishlist(productId) {
			const wishlist = this.getLocalWishlist();
			if (!wishlist.includes(productId)) {
				wishlist.push(productId);
				localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
			}
		}

		removeFromLocalWishlist(productId) {
			const wishlist = this.getLocalWishlist();
			const filtered = wishlist.filter(id => id !== productId);
			localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
		}

		getBlockSettings() {
			// In production, these would come from the Liquid template
			return {
				buttonText: this.button.dataset.buttonText || 'Add to Wishlist',
				buttonTextAdded: this.button.dataset.buttonTextAdded || 'Added to Wishlist',
			};
		}

		dispatchWishlistEvent(action, productId) {
			const event = new CustomEvent('wishlist:change', {
				detail: { action, productId }
			});
			window.dispatchEvent(event);
		}
	}

	// Initialize all wishlist buttons on the page
	function initWishlistButtons() {
		const buttons = document.querySelectorAll('[data-wishlist-button]');
		buttons.forEach(button => {
			if (!button.dataset.wishlistInitialized) {
				new WishlistButton(button);
				button.dataset.wishlistInitialized = 'true';
			}
		});
	}

	// Initialize on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initWishlistButtons);
	} else {
		initWishlistButtons();
	}

	// Re-initialize on dynamic content updates (for AJAX-loaded content)
	if (window.MutationObserver) {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes.length) {
					initWishlistButtons();
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

})();
