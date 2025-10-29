/**
 * Wishlist Admin Block Extension
 * Displays customer's wishlist in the admin customer details page
 */

import {
  reactExtension,
  useApi,
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

export default reactExtension(
  'admin.customer-details.block.render',
  () => <WishlistAdminBlock />
);

function WishlistAdminBlock() {
  const { data, query } = useApi();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get the customer ID from the admin context
  const customerId = data?.selected?.[0]?.id;

  useEffect(() => {
    if (customerId) {
      fetchCustomerWishlist();
    } else {
      setLoading(false);
    }
  }, [customerId]);

  async function fetchCustomerWishlist() {
    setLoading(true);
    setError(null);

    try {
      // Query customer metafield for wishlist
      const customerQuery = `
        query GetCustomerWishlist($customerId: ID!) {
          customer(id: $customerId) {
            id
            email
            firstName
            lastName
            metafield(namespace: "app", key: "wishlist") {
              value
            }
          }
        }
      `;

      const customerData = await query(customerQuery, {
        variables: { customerId: customerId },
      });

      const customer = customerData?.data?.customer;
      
      if (!customer) {
        setError('Customer not found');
        setLoading(false);
        return;
      }

      const wishlistValue = customer.metafield?.value;

      if (!wishlistValue) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      // Parse product IDs
      const productIds = JSON.parse(wishlistValue);

      if (!productIds || productIds.length === 0) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      // Fetch product details
      const productsQuery = `
        query GetProducts($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
              handle
              status
              featuredImage {
                url
                altText
              }
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              totalInventory
            }
          }
        }
      `;

      const productsData = await query(productsQuery, {
        variables: { ids: productIds },
      });

      setWishlist(productsData?.data?.nodes || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }

  if (!customerId) {
    return (
      <AdminBlock title="Customer Wishlist">
        <Text>No customer selected</Text>
      </AdminBlock>
    );
  }

  if (loading) {
    return (
      <AdminBlock title="Customer Wishlist">
        <BlockStack spacing="base">
          <ProgressIndicator size="small-100" />
          <Text>Loading wishlist...</Text>
        </BlockStack>
      </AdminBlock>
    );
  }

  if (error) {
    return (
      <AdminBlock title="Customer Wishlist">
        <Banner status="critical">
          {error}
        </Banner>
      </AdminBlock>
    );
  }

  if (wishlist.length === 0) {
    return (
      <AdminBlock title="Customer Wishlist">
        <Text tone="subdued">
          This customer hasn't added any products to their wishlist yet.
        </Text>
      </AdminBlock>
    );
  }

  return (
    <AdminBlock title="Customer Wishlist">
      <BlockStack spacing="base">
        <Text tone="subdued">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in wishlist
        </Text>

        <BlockStack spacing="base">
          {wishlist.map((product) => (
            <BlockStack key={product.id} spacing="base" inlineAlignment="start">
              <InlineStack spacing="base" blockAlignment="center">
                {product.featuredImage && (
                  <Image
                    source={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                  />
                )}

                <BlockStack spacing="base">
                  <Link
                    url={`shopify://admin/products/${product.id.split('/').pop()}`}
                  >
                    <Text fontWeight="bold">{product.title}</Text>
                  </Link>

                  <InlineStack spacing="base">
                    <Badge
                      tone={product.status === 'ACTIVE' ? 'success' : 'info'}
                    >
                      {product.status}
                    </Badge>

                    {product.totalInventory !== null && (
                      <Text tone="subdued">
                        {product.totalInventory} in stock
                      </Text>
                    )}
                  </InlineStack>

                  <Text fontWeight="bold">
                    {product.priceRangeV2?.minVariantPrice?.amount}{' '}
                    {product.priceRangeV2?.minVariantPrice?.currencyCode}
                  </Text>
                </BlockStack>
              </InlineStack>
            </BlockStack>
          ))}
        </BlockStack>
      </BlockStack>
    </AdminBlock>
  );
}
