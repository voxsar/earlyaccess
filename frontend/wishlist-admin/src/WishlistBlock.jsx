import {
	extension,
	AdminBlock,
	Text,
	BlockStack,
	InlineStack,
	ProgressIndicator,
	Banner,
	Image,
	Link,
	Badge
} from '@shopify/ui-extensions/admin';

export default extension('admin.customer-details.block.render', (root, api) => {
	const { data, sessionToken } = api;
	const customerId = data?.selected?.[0]?.id;

	let wishlist = [];
	let loading = true;
	let error = null;

	const adminBlock = root.createComponent(AdminBlock, { title: 'Customer Wishlist' });

	// Show initial loading state
	if (!customerId) {
		adminBlock.appendChild(
			root.createComponent(Text, {}, 'No customer selected')
		);
	} else if (!sessionToken) {
		const loadingStack = root.createComponent(BlockStack, { spacing: 'base' });
		loadingStack.appendChild(root.createComponent(ProgressIndicator, { size: 'small-100' }));
		loadingStack.appendChild(root.createComponent(Text, {}, 'Authenticating...'));
		adminBlock.appendChild(loadingStack);
	} else {
		// Fetch wishlist data
		fetchCustomerWishlist(customerId, sessionToken)
			.then(items => {
				wishlist = items;
				loading = false;
				renderWishlist();
			})
			.catch(err => {
				error = err.message;
				loading = false;
				renderError();
			});

		const loadingStack = root.createComponent(BlockStack, { spacing: 'base' });
		loadingStack.appendChild(root.createComponent(ProgressIndicator, { size: 'small-100' }));
		loadingStack.appendChild(root.createComponent(Text, {}, 'Loading wishlist...'));
		adminBlock.appendChild(loadingStack);
	}

	root.appendChild(adminBlock);

	async function fetchCustomerWishlist(customerId, sessionToken) {
		const BACKEND_API_URL = 'https://earlyaccessapi.dev.artslabcreatives.com';

		if (!sessionToken) {
			throw new Error('Session token is required for admin API calls');
		}

		const response = await fetch(
			`${BACKEND_API_URL}/api/wishlist/${customerId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionToken}`,
				},
			}
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error?.message || 'Failed to get customer wishlist');
		}

		const data = await response.json();
		return data.data.items;
	}

	function renderWishlist() {
		// Clear existing content
		adminBlock.removeChild(adminBlock.children[0]);

		if (wishlist.length === 0) {
			adminBlock.appendChild(
				root.createComponent(Text, { tone: 'subdued' }, 'This customer hasn\'t added any products to their wishlist yet.')
			);
		} else {
			const mainStack = root.createComponent(BlockStack, { spacing: 'base' });

			mainStack.appendChild(
				root.createComponent(Text, { tone: 'subdued' }, `${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'} in wishlist`)
			);

			const itemsStack = root.createComponent(BlockStack, { spacing: 'base' });

			wishlist.forEach(item => {
				const itemStack = root.createComponent(BlockStack, { spacing: 'base', inlineAlignment: 'start' });
				const itemInlineStack = root.createComponent(InlineStack, { spacing: 'base', blockAlignment: 'center' });

				if (item.imageUrl) {
					itemInlineStack.appendChild(
						root.createComponent(Image, { source: item.imageUrl, alt: item.title })
					);
				}

				const detailsStack = root.createComponent(BlockStack, { spacing: 'base' });

				detailsStack.appendChild(
					root.createComponent(Link, { url: `shopify://admin/products/${item.productId.split('/').pop()}` },
						root.createComponent(Text, { fontWeight: 'bold' }, item.title)
					)
				);

				const badgeStack = root.createComponent(InlineStack, { spacing: 'base' });
				badgeStack.appendChild(
					root.createComponent(Badge, { tone: item.availableForSale ? 'success' : 'info' },
						item.availableForSale ? 'Available' : 'Unavailable'
					)
				);
				detailsStack.appendChild(badgeStack);

				detailsStack.appendChild(
					root.createComponent(Text, { fontWeight: 'bold' }, `${item.price} ${item.currency}`)
				);

				itemInlineStack.appendChild(detailsStack);
				itemStack.appendChild(itemInlineStack);
				itemsStack.appendChild(itemStack);
			});

			mainStack.appendChild(itemsStack);
			adminBlock.appendChild(mainStack);
		}
	}

	function renderError() {
		// Clear existing content
		adminBlock.removeChild(adminBlock.children[0]);

		adminBlock.appendChild(
			root.createComponent(Banner, { status: 'critical' }, `Failed to load wishlist: ${error}`)
		);
	}
});