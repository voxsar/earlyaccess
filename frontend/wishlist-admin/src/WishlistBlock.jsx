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

export default reactExtension('admin.customer-details.block.render', () => <WishlistAdminBlock />);

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
