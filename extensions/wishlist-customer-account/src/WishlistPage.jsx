/**
 * Wishlist Customer Account Full Page Extension
 * Displays customer's wishlist with product cards and management features
 */

import {
  reactExtension,
  useApi,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Heading,
  Image,
  Spinner,
  Banner,
  Grid,
  GridItem,
  View,
  Page,
} from '@shopify/ui-extensions-react/customer-account';
import { useEffect, useState } from 'react';

export default reactExtension(
  'customer-account.page.render',
  () => <WishlistPage />
);

function WishlistPage() {
  const { query, i18n } = useApi();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removeLoading, setRemoveLoading] = useState({
    id: null,
    loading: false,
  });

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    setLoading(true);
    setError(null);

    try {
      // First, get the customer's wishlist from metafields
      const customerQuery = `
        query {
          customer {
            id
            metafield(namespace: "app", key: "wishlist") {
              value
            }
          }
        }
      `;

      const customerData = await query(customerQuery);
      const wishlistValue = customerData?.data?.customer?.metafield?.value;
      
      if (!wishlistValue) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      // Parse the wishlist product IDs
      const productIds = JSON.parse(wishlistValue);

      if (!productIds || productIds.length === 0) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      // Query for product details
      const productsQuery = `
        query GetProducts($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
              handle
              onlineStoreUrl
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              featuredImage {
                url
                altText
              }
              availableForSale
              totalInventory
            }
          }
        }
      `;

      const productsData = await query(productsQuery, {
        variables: { ids: productIds },
      });

      setWishlist(productsData.data?.nodes || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function removeFromWishlist(productId) {
    setRemoveLoading({ loading: true, id: productId });

    try {
      // Get current wishlist
      const customerQuery = `
        query {
          customer {
            id
            metafield(namespace: "app", key: "wishlist") {
              value
            }
          }
        }
      `;

      const customerData = await query(customerQuery);
      const customerId = customerData?.data?.customer?.id;
      const currentWishlist = JSON.parse(
        customerData?.data?.customer?.metafield?.value || '[]'
      );

      // Remove product from wishlist
      const updatedWishlist = currentWishlist.filter(
        (id) => id !== productId
      );

      // Update metafield
      const updateMutation = `
        mutation UpdateWishlist($customerId: ID!, $metafields: [MetafieldsSetInput!]!) {
          metafieldsSet(metafields: $metafields) {
            metafields {
              id
              namespace
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      await query(updateMutation, {
        variables: {
          customerId: customerId,
          metafields: [
            {
              ownerId: customerId,
              namespace: 'app',
              key: 'wishlist',
              value: JSON.stringify(updatedWishlist),
              type: 'list.product_reference',
            },
          ],
        },
      });

      // Update local state
      setWishlist(wishlist.filter((item) => item.id !== productId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item. Please try again.');
    } finally {
      setRemoveLoading({ loading: false, id: null });
    }
  }

  if (loading) {
    return (
      <Page title="My Wishlist">
        <BlockStack spacing="base">
          <Spinner size="large" />
          <Text>Loading your wishlist...</Text>
        </BlockStack>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="My Wishlist">
        <Banner status="critical">
          {error}
        </Banner>
      </Page>
    );
  }

  if (wishlist.length === 0) {
    return (
      <Page title="My Wishlist">
        <BlockStack spacing="base" inlineAlignment="center">
          <Text size="large">Your wishlist is empty</Text>
          <Text appearance="subdued">
            Start adding products to your wishlist to keep track of items you love!
          </Text>
          <Button to="/">
            Continue Shopping
          </Button>
        </BlockStack>
      </Page>
    );
  }

  return (
    <Page title="My Wishlist">
      <BlockStack spacing="base">
        <Text appearance="subdued">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
        </Text>

        <Grid
          columns={['fill', 'fill', 'fill']}
          spacing="base"
        >
          {wishlist.map((product) => (
            <GridItem key={product.id}>
              <View border="base" padding="base" cornerRadius="base">
                <BlockStack spacing="base">
                  {product.featuredImage && (
                    <Image
                      source={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      aspectRatio={1}
                    />
                  )}

                  <BlockStack spacing="tight">
                    <Text emphasis="bold">{product.title}</Text>

                    <Text emphasis="bold" size="large">
                      {i18n.formatCurrency(
                        product.priceRange.minVariantPrice.amount,
                        {
                          currency: product.priceRange.minVariantPrice.currencyCode,
                        }
                      )}
                    </Text>

                    {!product.availableForSale && (
                      <Text appearance="critical">Out of Stock</Text>
                    )}
                  </BlockStack>

                  <InlineStack spacing="tight">
                    <Button
                      to={product.onlineStoreUrl}
                      kind="primary"
                    >
                      View Product
                    </Button>

                    <Button
                      loading={
                        removeLoading.loading && product.id === removeLoading.id
                      }
                      onPress={() => removeFromWishlist(product.id)}
                    >
                      Remove
                    </Button>
                  </InlineStack>
                </BlockStack>
              </View>
            </GridItem>
          ))}
        </Grid>
      </BlockStack>
    </Page>
  );
}
