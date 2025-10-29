import { extension, Page, BlockStack, InlineStack, Text, Button, Image, Spinner, Banner, Grid, GridItem, View } from '@shopify/ui-extensions/customer-account';
import { getWishlist, removeFromWishlist } from './api/backendApi';

export default extension('customer-account.page.render', (root, api) => {
	const { query, i18n } = api;
	let wishlist = [];
	let loading = true;
	let error = null;
	let customerId = null;
	let removeLoading = { id: null, loading: false };

	// Fetch customer ID
	async function fetchCustomerId() {
		try {
			const customerData = await query('query{customer{id}}');
			const rawCustomerId = customerData?.data?.customer?.id;

			// Extract numeric ID from Shopify GID format (gid://shopify/Customer/123456789)
			if (rawCustomerId && rawCustomerId.includes('gid://shopify/Customer/')) {
				customerId = rawCustomerId.split('/').pop();
			} else {
				customerId = rawCustomerId;
			}

			console.log('Customer ID:', customerId); // Debug log

			if (customerId) {
				await fetchWishlist();
			}
		} catch (err) {
			console.error('Error fetching customer ID:', err);
			error = 'Failed to load customer data. Please try again.';
			loading = false;
			root.render(renderUI());
		}
	}

	// Fetch wishlist data
	async function fetchWishlist() {
		loading = true;
		error = null;
		root.render(renderUI());

		try {
			const items = await getWishlist(customerId);
			wishlist = items;
		} catch (err) {
			console.error('Error fetching wishlist:', err);
			error = 'Failed to load wishlist. Please try again.';
		} finally {
			loading = false;
			root.render(renderUI());
		}
	}

	// Handle remove from wishlist
	async function handleRemoveFromWishlist(productId) {
		removeLoading = { loading: true, id: productId };
		root.render(renderUI());

		try {
			await removeFromWishlist(customerId, productId);
			wishlist = wishlist.filter((item) => item.productId !== productId);
		} catch (err) {
			console.error('Error removing from wishlist:', err);
			error = 'Failed to remove item. Please try again.';
		} finally {
			removeLoading = { loading: false, id: null };
			root.render(renderUI());
		}
	}

	// Function to render the UI
	function renderUI() {
		if (loading) {
			return root.createComponent(Page, { title: 'My Wishlist' }, [
				root.createComponent(BlockStack, { spacing: 'base' }, [
					root.createComponent(Spinner, { size: 'large' }),
					root.createComponent(Text, {}, 'Loading your wishlist...')
				])
			]);
		}

		if (error) {
			return root.createComponent(Page, { title: 'My Wishlist' }, [
				root.createComponent(Banner, { status: 'critical' }, error)
			]);
		}

		if (wishlist.length === 0) {
			return root.createComponent(Page, { title: 'My Wishlist' }, [
				root.createComponent(BlockStack, { spacing: 'base', inlineAlignment: 'center' }, [
					root.createComponent(Text, { size: 'large' }, 'Your wishlist is empty'),
					root.createComponent(Text, { appearance: 'subdued' },
						'Start adding products to your wishlist to keep track of items you love!'),
					root.createComponent(Button, { to: '/' }, 'Continue Shopping')
				])
			]);
		}

		// Render wishlist items
		const items = wishlist.map((item) => {
			return root.createComponent(GridItem, {}, [
				root.createComponent(View, { border: 'base', padding: 'base', cornerRadius: 'base' }, [
					root.createComponent(BlockStack, { spacing: 'base' }, [
						...(item.imageUrl ? [root.createComponent(Image, { source: item.imageUrl, alt: item.title, aspectRatio: 1 })] : []),
						root.createComponent(BlockStack, { spacing: 'tight' }, [
							root.createComponent(Text, { emphasis: 'bold' }, item.title),
							root.createComponent(Text, { emphasis: 'bold', size: 'large' },
								i18n.formatCurrency(item.price, { currency: item.currency })),
							...(!item.availableForSale ? [root.createComponent(Text, { appearance: 'critical' }, 'Out of Stock')] : [])
						]),
						root.createComponent(InlineStack, { spacing: 'tight' }, [
							root.createComponent(Button, { to: item.url, kind: 'primary' }, 'View Product'),
							root.createComponent(Button, {
								loading: removeLoading.loading && item.productId === removeLoading.id,
								onPress: () => handleRemoveFromWishlist(item.productId)
							}, 'Remove')
						])
					])
				])
			]);
		});

		return root.createComponent(Page, { title: 'My Wishlist' }, [
			root.createComponent(BlockStack, { spacing: 'base' }, [
				root.createComponent(Text, { appearance: 'subdued' },
					`${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'} in your wishlist`),
				root.createComponent(Grid, { columns: ['fill', 'fill', 'fill'], spacing: 'base' }, items)
			])
		]);
	}

	// Initial load
	fetchCustomerId();
	root.render(renderUI());
});