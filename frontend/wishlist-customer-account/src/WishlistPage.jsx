import {
  reactExtension,
  useApi,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Image,
  Spinner,
  Banner,
  Grid,
  GridItem,
  View,
  Page,
} from '@shopify/ui-extensions-react/customer-account';
import { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from './api/backendApi';

export default reactExtension('customer-account.page.render', () => <WishlistPage />);

function WishlistPage() {
  const { query, i18n } = useApi();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removeLoading, setRemoveLoading] = useState({ id: null, loading: false });
  const [customerId, setCustomerId] = useState(null);

  useEffect(() => {
    fetchCustomerId();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchWishlist();
    }
  }, [customerId]);

  async function fetchCustomerId() {
    try {
      const customerData = await query('query{customer{id}}');
      setCustomerId(customerData?.data?.customer?.id);
    } catch (error) {
      console.error('Error fetching customer ID:', error);
      setError('Failed to load customer data. Please try again.');
      setLoading(false);
    }
  }

  async function fetchWishlist() {
    setLoading(true);
    setError(null);
    try {
      const items = await getWishlist(customerId);
      setWishlist(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFromWishlist(productId) {
    setRemoveLoading({ loading: true, id: productId });
    try {
      await removeFromWishlist(customerId, productId);
      setWishlist(wishlist.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setError('Failed to remove item. Please try again.');
    } finally {
      setRemoveLoading({ loading: false, id: null });
    }
  }

  return (
    <Page title="My Wishlist">
      {loading ? (
        <BlockStack spacing="base">
          <Spinner size="large" />
          <Text>Loading your wishlist...</Text>
        </BlockStack>
      ) : error ? (
        <Banner status="critical">{error}</Banner>
      ) : wishlist.length === 0 ? (
        <BlockStack spacing="base" inlineAlignment="center">
          <Text size="large">Your wishlist is empty</Text>
          <Text appearance="subdued">Start adding products to your wishlist to keep track of items you love!</Text>
          <Button to="/">Continue Shopping</Button>
        </BlockStack>
      ) : (
        <BlockStack spacing="base">
          <Text appearance="subdued">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist</Text>
          <Grid columns={['fill', 'fill', 'fill']} spacing="base">
            {wishlist.map((item) => (
              <GridItem key={item.productId}>
                <View border="base" padding="base" cornerRadius="base">
                  <BlockStack spacing="base">
                    {item.imageUrl && <Image source={item.imageUrl} alt={item.title} aspectRatio={1} />}
                    <BlockStack spacing="tight">
                      <Text emphasis="bold">{item.title}</Text>
                      <Text emphasis="bold" size="large">{i18n.formatCurrency(item.price, { currency: item.currency })}</Text>
                      {!item.availableForSale && <Text appearance="critical">Out of Stock</Text>}
                    </BlockStack>
                    <InlineStack spacing="tight">
                      <Button to={item.url} kind="primary">View Product</Button>
                      <Button loading={removeLoading.loading && item.productId === removeLoading.id} onPress={() => handleRemoveFromWishlist(item.productId)}>Remove</Button>
                    </InlineStack>
                  </BlockStack>
                </View>
              </GridItem>
            ))}
          </Grid>
        </BlockStack>
      )}
    </Page>
  );
}
