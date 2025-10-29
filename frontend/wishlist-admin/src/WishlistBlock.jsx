import { extension, AdminBlock, Text, BlockStack, InlineStack, ProgressIndicator, Banner, Image, Link, Badge } from '@shopify/ui-extensions/admin';
import { getCustomerWishlist } from './api/backendApi';

export default extension('admin.customer-details.block.render', (root, api) => {
	const { data } = api;
	let wishlist = [];
	let loading = true;
	let error = null;

	// Fetch wishlist data
	async function fetchCustomerWishlist(customerId) {
		loading = true;
		error = null;
		root.render(renderUI());

		try {
			const items = await getCustomerWishlist(customerId);
			wishlist = items;
		} catch (err) {
			console.error('Error fetching wishlist:', err);
			error = 'Failed to load wishlist';
		} finally {
			loading = false;
			root.render(renderUI());
		}
	}

	// Function to render the UI
	function renderUI() {
		const customerId = data?.selected?.[0]?.id;

		if (!customerId) {
			return root.createComponent(AdminBlock, { title: 'Customer Wishlist' }, [
				root.createComponent(Text, {}, 'No customer selected')
			]);
		}

		if (loading) {
			return root.createComponent(AdminBlock, { title: 'Customer Wishlist' }, [
				root.createComponent(BlockStack, { spacing: 'base' }, [
					root.createComponent(ProgressIndicator, { size: 'small-100' }),
					root.createComponent(Text, {}, 'Loading wishlist...')
				])
			]);
		}

		if (error) {
			return root.createComponent(AdminBlock, { title: 'Customer Wishlist' }, [
				root.createComponent(Banner, { status: 'critical' }, error)
			]);
		}

		if (wishlist.length === 0) {
			return root.createComponent(AdminBlock, { title: 'Customer Wishlist' }, [
				root.createComponent(Text, { tone: 'subdued' }, "This customer hasn't added any products to their wishlist yet.")
			]);
		}

		// Render wishlist items
		const items = wishlist.map((item) => {
			const productIdParts = item.productId.split('/');
			const productId = productIdParts[productIdParts.length - 1];

			return root.createComponent(BlockStack, { spacing: 'base', inlineAlignment: 'start' }, [
				root.createComponent(InlineStack, { spacing: 'base', blockAlignment: 'center' }, [
					...(item.imageUrl ? [root.createComponent(Image, { source: item.imageUrl, alt: item.title })] : []),
					root.createComponent(BlockStack, { spacing: 'base' }, [
						root.createComponent(Link, { url: `shopify://admin/products/${productId}` }, [
							root.createComponent(Text, { fontWeight: 'bold' }, item.title)
						]),
						root.createComponent(InlineStack, { spacing: 'base' }, [
							root.createComponent(Badge, { tone: item.availableForSale ? 'success' : 'info' },
								item.availableForSale ? 'Available' : 'Unavailable')
						]),
						root.createComponent(Text, { fontWeight: 'bold' }, `${item.price} ${item.currency}`)
					])
				])
			]);
		});

		return root.createComponent(AdminBlock, { title: 'Customer Wishlist' }, [
			root.createComponent(BlockStack, { spacing: 'base' }, [
				root.createComponent(Text, { tone: 'subdued' },
					`${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'} in wishlist`),
				root.createComponent(BlockStack, { spacing: 'base' }, items)
			])
		]);
	}

	// Watch for customer changes
	api.data.subscribe((newData) => {
		const customerId = newData?.selected?.[0]?.id;
		if (customerId) {
			fetchCustomerWishlist(customerId);
		} else {
			loading = false;
			wishlist = [];
			root.render(renderUI());
		}
	});

	// Initial render
	const customerId = data?.selected?.[0]?.id;
	if (customerId) {
		fetchCustomerWishlist(customerId);
	} else {
		loading = false;
		root.render(renderUI());
	}
});
