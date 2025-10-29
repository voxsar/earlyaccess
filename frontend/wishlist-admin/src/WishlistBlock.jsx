import {
  reactExtension,
  useApi,
  useSessionToken,
  AdminBlock,
  Text,
  BlockStack,
  InlineStack,
  ProgressIndicator,
  Banner,
  Image,
  Link,
  Badge,
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState } from 'react';
import { getCustomerWishlist } from './api/backendApi';

export default extension('admin.customer-details.block.render', (root, api) => {
	const { data } = api;
	let wishlist = [];
	let loading = true;
	let error = null;

<<<<<<< HEAD
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
=======
function WishlistAdminBlock() {
  const { data } = useApi();
  const sessionToken = useSessionToken();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const customerId = data?.selected?.[0]?.id;

  useEffect(() => {
    if (customerId && sessionToken) {
      fetchCustomerWishlist();
    } else {
      setLoading(false);
    }
  }, [customerId, sessionToken]);

  async function fetchCustomerWishlist() {
    setLoading(true);
    setError(null);
    try {
      const items = await getCustomerWishlist(customerId, sessionToken);
      setWishlist(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError(`Failed to load wishlist: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminBlock title="Customer Wishlist">
      {!customerId ? (
        <Text>No customer selected</Text>
      ) : !sessionToken ? (
        <BlockStack spacing="base">
          <ProgressIndicator size="small-100" />
          <Text>Authenticating...</Text>
        </BlockStack>
      ) : loading ? (
        <BlockStack spacing="base">
          <ProgressIndicator size="small-100" />
          <Text>Loading wishlist...</Text>
        </BlockStack>
      ) : error ? (
        <Banner status="critical">{error}</Banner>
      ) : wishlist.length === 0 ? (
        <Text tone="subdued">This customer hasn't added any products to their wishlist yet.</Text>
      ) : (
        <BlockStack spacing="base">
          <Text tone="subdued">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in wishlist</Text>
          <BlockStack spacing="base">
            {wishlist.map((item) => (
              <BlockStack key={item.productId} spacing="base" inlineAlignment="start">
                <InlineStack spacing="base" blockAlignment="center">
                  {item.imageUrl && <Image source={item.imageUrl} alt={item.title} />}
                  <BlockStack spacing="base">
                    <Link url={`shopify://admin/products/${item.productId.split('/').pop()}`}>
                      <Text fontWeight="bold">{item.title}</Text>
                    </Link>
                    <InlineStack spacing="base">
                      <Badge tone={item.availableForSale ? 'success' : 'info'}>
                        {item.availableForSale ? 'Available' : 'Unavailable'}
                      </Badge>
                    </InlineStack>
                    <Text fontWeight="bold">{item.price} {item.currency}</Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            ))}
          </BlockStack>
        </BlockStack>
      )}
    </AdminBlock>
  );
}
>>>>>>> 8c16112a291cdf638e540e4614c63761e4fa2e16
