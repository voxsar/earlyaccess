/**
 * Unified Wishlist Component JavaScript
 * Handles both regular button and floating button functionality
 */

(function () {
	'use strict';

	// Configuration
	const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';
	const STORAGE_KEY = 'wishlist_products';

	class UnifiedWishlistComponent {
		constructor(containerElement) {
			this.container = containerElement;
			this.customerId = this.container.dataset.customerId;
			this.displayMode = this.container.dataset.displayMode;
			this.shopUrl = window.Shopify?.shop;

			// Common elements
			this.button = this.container.querySelector('[data-wishlist-btn]');

			if (this.displayMode === 'floating') {
				this.initFloatingMode();
			} else {
				this.initRegularMode();
			}
		}

		initRegularMode() {
			this.productId = this.container.dataset.productId;
			this.productHandle = this.container.dataset.productHandle;
			this.textElement = this.button.querySelector('[data-wishlist-text]');
			this.iconElement = this.button.querySelector('[data-wishlist-icon]');

			this.loadWishlistState();
			this.attachRegularEventListeners();
		}

		initFloatingMode() {
			// Floating mode elements
			this.popup = this.container.querySelector('[data-wishlist-popup]');
			this.backdrop = this.container.querySelector('[data-wishlist-backdrop]');
			this.closeBtn = this.container.querySelector('[data-wishlist-close]');
			this.countBadge = this.container.querySelector('[data-wishlist-count]');

			// Content elements (only for logged in users)
			this.loadingElement = this.container.querySelector('[data-wishlist-loading]');
			this.emptyElement = this.container.querySelector('[data-wishlist-empty]');
			this.itemsContainer = this.container.querySelector('[data-wishlist-items]');
			this.footer = this.container.querySelector('[data-wishlist-footer]');
			this.loginRequiredElement = this.container.querySelector('[data-wishlist-login-required]');

			// Action buttons (only for logged in users)  
			this.addAllBtn = this.container.querySelector('[data-add-all-to-cart]');
			this.clearAllBtn = this.container.querySelector('[data-clear-wishlist]');

			// State
			this.isOpen = false;
			this.wishlistItems = [];
			this.isLoading = false;

			// Only load wishlist data if user is logged in
			if (this.customerId) {
				this.loadWishlistCount();
			}

			this.attachFloatingEventListeners();

			// Listen for wishlist changes from other components
			window.addEventListener('wishlist:change', (e) => {
				this.handleWishlistChange(e.detail);
			});
		}

		// ==================== REGULAR BUTTON METHODS ====================

		attachRegularEventListeners() {
			this.button.addEventListener('click', (e) => {
				e.preventDefault();
				this.toggleWishlist();
			});
		}

		async loadWishlistState() {
			try {
				const isInWishlist = await this.checkWishlistStatus();
				this.updateRegularButtonState(isInWishlist);
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

			// Then verify with server
			return false;
		}

		async toggleWishlist() {
			this.setRegularLoadingState(true);

			try {
				const isInWishlist = this.button.classList.contains('wishlist-unified-button--added');

				if (isInWishlist) {
					await this.removeFromWishlist();
				} else {
					await this.addToWishlist();
				}
			} catch (error) {
				this.showToast('An error occurred. Please try again.', 'error');
				console.error('Wishlist error:', error);
			} finally {
				this.setRegularLoadingState(false);
			}
		}

		async addToWishlist() {
			// Update local storage immediately for better UX
			this.addToLocalWishlist(this.productId);

			// Update UI
			this.updateRegularButtonState(true);
			this.showToast('Added to wishlist!', 'success');

			// Make API call to backend
			try {
				const headers = {
					'Content-Type': 'application/json',
				};

				if (this.shopUrl) {
					headers['X-Shop-Domain'] = this.shopUrl;
				}

				const response = await fetch(`${BACKEND_API_URL}/api/wishlist/add`, {
					method: 'POST',
					headers,
					body: JSON.stringify({
						customerId: this.customerId,
						productId: this.productId,
						productHandle: this.productHandle,
						shopUrl: this.shopUrl,
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to add to wishlist');
				}

				// Dispatch custom event
				this.dispatchWishlistEvent('added', this.productId);
			} catch (error) {
				// If API call fails, revert the UI changes
				this.removeFromLocalWishlist(this.productId);
				this.updateRegularButtonState(false);
				this.showToast('Failed to add to wishlist', 'error');
				throw error;
			}
		}

		updateRegularButtonState(isInWishlist) {
			const settings = this.getBlockSettings();

			if (isInWishlist) {
				this.button.classList.add('wishlist-unified-button--added');
				if (this.textElement) {
					this.textElement.textContent = settings.buttonTextAdded || 'Added to Wishlist';
				}
				this.button.setAttribute('aria-label', 'Remove from wishlist');
			} else {
				this.button.classList.remove('wishlist-unified-button--added');
				if (this.textElement) {
					this.textElement.textContent = settings.buttonText || 'Add to Wishlist';
				}
				this.button.setAttribute('aria-label', 'Add to wishlist');
			}
		}

		setRegularLoadingState(isLoading) {
			if (isLoading) {
				this.button.classList.add('wishlist-unified-button--loading');
				this.button.disabled = true;
			} else {
				this.button.classList.remove('wishlist-unified-button--loading');
				this.button.disabled = false;
			}
		}

		// ==================== FLOATING BUTTON METHODS ====================

		attachFloatingEventListeners() {
			// Open popup
			this.button.addEventListener('click', () => this.openPopup());

			// Close popup
			this.closeBtn.addEventListener('click', () => this.closePopup());
			this.backdrop.addEventListener('click', () => this.closePopup());

			// Escape key to close
			document.addEventListener('keydown', (e) => {
				if (e.key === 'Escape' && this.isOpen) {
					this.closePopup();
				}
			});

			// Bottom action buttons (only if they exist - for logged in users)
			if (this.addAllBtn) {
				this.addAllBtn.addEventListener('click', () => this.addAllToCart());
			}
			if (this.clearAllBtn) {
				this.clearAllBtn.addEventListener('click', () => this.clearWishlist());
			}
		}

		async openPopup() {
			if (this.isOpen) return;

			this.isOpen = true;
			this.popup.classList.add('active');
			this.backdrop.classList.add('active');

			// Prevent body scroll
			document.body.style.overflow = 'hidden';

			// Only load wishlist items if user is logged in
			if (this.customerId) {
				await this.loadWishlistItems();
			}
			// For non-logged users, the login required state is already shown via Liquid template
		}

		closePopup() {
			if (!this.isOpen) return;

			this.isOpen = false;
			this.popup.classList.remove('active');
			this.backdrop.classList.remove('active');

			// Restore body scroll
			document.body.style.overflow = '';
		}

		async loadWishlistCount() {
			try {
				const count = await this.getWishlistCount();
				this.updateCountBadge(count);
			} catch (error) {
				console.error('Error loading wishlist count:', error);
			}
		}

		async loadWishlistItems() {
			if (this.isLoading) return;

			this.isLoading = true;
			this.showLoading();

			try {
				const wishlistData = await this.fetchWishlistItems();
				this.wishlistItems = wishlistData.items || [];
				this.renderWishlistItems();
				this.updateCountBadge(this.wishlistItems.length);
			} catch (error) {
				console.error('Error loading wishlist items:', error);
				this.showError('Failed to load wishlist items');
			} finally {
				this.isLoading = false;
				this.hideLoading();
			}
		}

		async fetchWishlistItems() {
			const headers = {
				'Content-Type': 'application/json',
			};

			if (this.shopUrl) {
				headers['X-Shop-Domain'] = this.shopUrl;
			}

			const response = await fetch(`${BACKEND_API_URL}/api/wishlist/customer/${this.customerId}`, {
				method: 'GET',
				headers,
			});

			if (!response.ok) {
				throw new Error('Failed to fetch wishlist items');
			}

			const data = await response.json();
			return data.data;
		}

		async getWishlistCount() {
			try {
				const headers = {
					'Content-Type': 'application/json',
				};

				if (this.shopUrl) {
					headers['X-Shop-Domain'] = this.shopUrl;
				}

				const response = await fetch(`${BACKEND_API_URL}/api/wishlist/customer/${this.customerId}/count`, {
					method: 'GET',
					headers,
				});

				if (!response.ok) {
					throw new Error('Failed to get wishlist count');
				}

				const data = await response.json();
				return data.data.count;
			} catch (error) {
				// Fallback to local storage
				const localWishlist = this.getLocalWishlist();
				return localWishlist.length;
			}
		}

		renderWishlistItems() {
			if (this.wishlistItems.length === 0) {
				this.showEmpty();
				return;
			}

			this.showItems();
			this.itemsContainer.innerHTML = '';

			this.wishlistItems.forEach(item => {
				const itemElement = this.createWishlistItemElement(item);
				this.itemsContainer.appendChild(itemElement);
			});
		}

		createWishlistItemElement(item) {
			const itemDiv = document.createElement('div');
			itemDiv.className = 'wishlist-item';
			itemDiv.dataset.productId = item.productId;

			// Format date
			const addedDate = new Date(item.addedAt);
			const formattedDate = addedDate.toLocaleDateString('en-US', {
				day: '2-digit',
				month: 'short',
				year: 'numeric'
			});

			itemDiv.innerHTML = `
        <div class="wishlist-item-image">
          ${item.imageUrl ? `<img src="${this.escapeHtml(item.imageUrl)}" alt="${this.escapeHtml(item.title)}" loading="lazy">` : ''}
        </div>
        
        <div class="wishlist-item-info">
          <h4 class="wishlist-item-title">
            <a href="${this.escapeHtml(item.url)}" target="_blank">
              ${this.escapeHtml(item.title)}
            </a>
          </h4>
          <p class="wishlist-item-date">Added: ${formattedDate}</p>
          <p class="wishlist-item-price">${this.formatPrice(item.price, item.currency)}</p>
        </div>
        
        <div class="wishlist-item-actions">
          <button 
            type="button" 
            class="wishlist-item-btn wishlist-item-btn--add-cart"
            data-add-to-cart="${this.escapeHtml(item.productId)}"
            ${!item.availableForSale ? 'disabled' : ''}
          >
            Add to Cart
          </button>
          <button 
            type="button" 
            class="wishlist-item-btn wishlist-item-btn--remove"
            data-remove-item="${this.escapeHtml(item.productId)}"
          >
            Remove
          </button>
        </div>
      `;

			// Attach event listeners
			const addToCartBtn = itemDiv.querySelector('[data-add-to-cart]');
			const removeBtn = itemDiv.querySelector('[data-remove-item]');

			addToCartBtn.addEventListener('click', () => this.addToCart(item));
			removeBtn.addEventListener('click', () => this.removeItem(item.productId, itemDiv));

			return itemDiv;
		}

		async addToCart(item) {
			const button = this.container.querySelector(`[data-add-to-cart="${item.productId}"]`);

			try {
				button.disabled = true;
				button.textContent = 'Adding...';

				// Use Shopify AJAX API to add to cart
				const response = await fetch('/cart/add.js', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						id: item.variantId || item.productId,
						quantity: 1
					})
				});

				if (response.ok) {
					this.showToast('Added to cart!', 'success');

					// Trigger cart update event
					window.dispatchEvent(new CustomEvent('cart:update'));
				} else {
					throw new Error('Failed to add to cart');
				}
			} catch (error) {
				console.error('Error adding to cart:', error);
				this.showToast('Failed to add to cart', 'error');
			} finally {
				button.disabled = false;
				button.textContent = 'Add to Cart';
			}
		}

		async removeItem(productId, itemElement) {
			try {
				// Animate removal
				itemElement.classList.add('removing');

				// Wait for animation
				setTimeout(async () => {
					// Remove from backend
					await this.removeFromWishlistById(productId);

					// Remove from DOM
					itemElement.remove();

					// Update local state
					this.wishlistItems = this.wishlistItems.filter(item => item.productId !== productId);

					// Update UI
					this.updateCountBadge(this.wishlistItems.length);

					if (this.wishlistItems.length === 0) {
						this.showEmpty();
					}

					this.showToast('Removed from wishlist', 'success');
				}, 300);
			} catch (error) {
				// Revert animation on error
				itemElement.classList.remove('removing');
				console.error('Error removing item:', error);
				this.showToast('Failed to remove item', 'error');
			}
		}

		async addAllToCart() {
			const availableItems = this.wishlistItems.filter(item => item.availableForSale);

			if (availableItems.length === 0) {
				this.showToast('No items available to add to cart', 'error');
				return;
			}

			try {
				this.addAllBtn.disabled = true;
				this.addAllBtn.textContent = 'Adding...';

				// Add items one by one
				for (const item of availableItems) {
					await this.addToCart(item);
					// Small delay to prevent rate limiting
					await new Promise(resolve => setTimeout(resolve, 200));
				}

				this.showToast(`Added ${availableItems.length} items to cart!`, 'success');
			} catch (error) {
				console.error('Error adding all to cart:', error);
				this.showToast('Some items failed to add to cart', 'error');
			} finally {
				this.addAllBtn.disabled = false;
				this.addAllBtn.textContent = 'Add All to Cart';
			}
		}

		async clearWishlist() {
			if (!confirm('Are you sure you want to remove all items from your wishlist?')) {
				return;
			}

			try {
				this.clearAllBtn.disabled = true;
				this.clearAllBtn.textContent = 'Removing...';

				const headers = {
					'Content-Type': 'application/json',
				};

				if (this.shopUrl) {
					headers['X-Shop-Domain'] = this.shopUrl;
				}

				const response = await fetch(`${BACKEND_API_URL}/api/wishlist/clear`, {
					method: 'POST',
					headers,
					body: JSON.stringify({
						customerId: this.customerId,
						shopUrl: this.shopUrl,
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to clear wishlist');
				}

				// Clear local state
				this.wishlistItems = [];
				this.updateCountBadge(0);
				this.showEmpty();

				// Clear local storage
				localStorage.removeItem(STORAGE_KEY);

				this.showToast('Wishlist cleared', 'success');

				// Dispatch event
				this.dispatchWishlistEvent('cleared');

			} catch (error) {
				console.error('Error clearing wishlist:', error);
				this.showToast('Failed to clear wishlist', 'error');
			} finally {
				this.clearAllBtn.disabled = false;
				this.clearAllBtn.textContent = 'Remove All';
			}
		}

		// ==================== SHARED METHODS ====================

		async removeFromWishlist() {
			// Update local storage immediately
			this.removeFromLocalWishlist(this.productId);

			// Update UI
			this.updateRegularButtonState(false);
			this.showToast('Removed from wishlist', 'success');

			// Make API call to backend
			try {
				await this.removeFromWishlistById(this.productId);

				// Dispatch event
				this.dispatchWishlistEvent('removed', this.productId);
			} catch (error) {
				// If API call fails, revert the UI changes
				this.addToLocalWishlist(this.productId);
				this.updateRegularButtonState(true);
				this.showToast('Failed to remove from wishlist', 'error');
				throw error;
			}
		}

		async removeFromWishlistById(productId) {
			const headers = {
				'Content-Type': 'application/json',
			};

			if (this.shopUrl) {
				headers['X-Shop-Domain'] = this.shopUrl;
			}

			const response = await fetch(`${BACKEND_API_URL}/api/wishlist/remove`, {
				method: 'POST',
				headers,
				body: JSON.stringify({
					customerId: this.customerId,
					productId: productId,
					shopUrl: this.shopUrl,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to remove from wishlist');
			}

			// Update local storage
			this.removeFromLocalWishlist(productId);
		}

		// State management methods for floating mode
		showLoading() {
			if (this.loadingElement) {
				this.loadingElement.style.display = 'flex';
				this.emptyElement.style.display = 'none';
				this.itemsContainer.style.display = 'none';
				this.footer.style.display = 'none';
			}
		}

		hideLoading() {
			if (this.loadingElement) {
				this.loadingElement.style.display = 'none';
			}
		}

		showEmpty() {
			if (this.emptyElement) {
				this.emptyElement.style.display = 'block';
				this.itemsContainer.style.display = 'none';
				this.footer.style.display = 'none';
			}
		}

		showItems() {
			if (this.emptyElement && this.itemsContainer && this.footer) {
				this.emptyElement.style.display = 'none';
				this.itemsContainer.style.display = 'block';
				this.footer.style.display = 'flex';
			}
		}

		showError(message) {
			this.showToast(message, 'error');
		}

		updateCountBadge(count) {
			if (this.countBadge) {
				this.countBadge.textContent = count;
				this.countBadge.dataset.count = count;

				if (count > 0) {
					this.countBadge.style.display = 'inline-flex';
				} else {
					this.countBadge.style.display = 'none';
				}
			}
		}

		handleWishlistChange(detail) {
			// Update count when other components modify the wishlist
			if (this.displayMode === 'floating') {
				this.loadWishlistCount();

				// If popup is open, refresh the items
				if (this.isOpen) {
					this.loadWishlistItems();
				}
			}
		}

		// Utility methods
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
			if (this.displayMode === 'regular') {
				return {
					buttonText: this.button.dataset.buttonText || 'Add to Wishlist',
					buttonTextAdded: this.button.dataset.buttonTextAdded || 'Added to Wishlist',
				};
			}
			return {};
		}

		formatPrice(price, currency = 'USD') {
			const formatter = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: currency,
			});
			return formatter.format(parseFloat(price));
		}

		escapeHtml(unsafe) {
			return unsafe
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");
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

		dispatchWishlistEvent(action, productId = null) {
			const event = new CustomEvent('wishlist:change', {
				detail: { action, productId }
			});
			window.dispatchEvent(event);
		}
	}

	// Initialize all wishlist components on the page
	function initUnifiedWishlistComponents() {
		const containers = document.querySelectorAll('[data-wishlist-unified]');
		containers.forEach(container => {
			if (!container.dataset.wishlistUnifiedInitialized) {
				new UnifiedWishlistComponent(container);
				container.dataset.wishlistUnifiedInitialized = 'true';
			}
		});
	}

	// Initialize on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initUnifiedWishlistComponents);
	} else {
		initUnifiedWishlistComponents();
	}

	// Re-initialize on dynamic content updates
	if (window.MutationObserver) {
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.addedNodes.length) {
					initUnifiedWishlistComponents();
				}
			});
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	}

})();