/**
 * Wishlist Admin Block Extension
 * Displays customer's wishlist in the admin customer details page
 */

import '@shopify/ui-extensions/admin';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export default async (root) => {
  // Get the customer ID from the admin context
  const customerId = root.data.selected[0]?.id;
  
  render(<WishlistAdminBlock customerId={customerId} />, document.body);
};

function WishlistAdminBlock({ customerId }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customerId) {
      fetchCustomerWishlist();
    }
  }, [customerId]);

  async function fetchCustomerWishlist() {
    setLoading(true);
    setError(null);

    try {
      // Query customer metafield for wishlist
      const query = `
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

      const response = await fetch('shopify:admin/api/graphql.json', {
        method: 'POST',
        body: JSON.stringify({
          query: query,
          variables: { customerId: customerId },
        }),
      });

      const data = await response.json();
      const customer = data?.data?.customer;
      
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

      const productsResponse = await fetch('shopify:admin/api/graphql.json', {
        method: 'POST',
        body: JSON.stringify({
          query: productsQuery,
          variables: { ids: productIds },
        }),
      });

      const productsData = await productsResponse.json();
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
      <admin-block title="Customer Wishlist">
        <admin-text>No customer selected</admin-text>
      </admin-block>
    );
  }

  if (loading) {
    return (
      <admin-block title="Customer Wishlist">
        <admin-stack direction="vertical" gap="base">
          <admin-spinner size="small" />
          <admin-text>Loading wishlist...</admin-text>
        </admin-stack>
      </admin-block>
    );
  }

  if (error) {
    return (
      <admin-block title="Customer Wishlist">
        <admin-banner status="critical">
          <admin-text>{error}</admin-text>
        </admin-banner>
      </admin-block>
    );
  }

  if (wishlist.length === 0) {
    return (
      <admin-block title="Customer Wishlist">
        <admin-stack direction="vertical" gap="base">
          <admin-text appearance="subdued">
            This customer hasn't added any products to their wishlist yet.
          </admin-text>
        </admin-stack>
      </admin-block>
    );
  }

  return (
    <admin-block title="Customer Wishlist">
      <admin-stack direction="vertical" gap="base">
        <admin-text appearance="subdued">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in wishlist
        </admin-text>

        <admin-stack direction="vertical" gap="small">
          {wishlist.map((product) => (
            <admin-card key={product.id} padding="base">
              <admin-stack direction="horizontal" gap="base" alignItems="center">
                {product.featuredImage && (
                  <admin-image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    width="60px"
                    height="60px"
                  />
                )}

                <admin-stack direction="vertical" gap="small-200" flex="1">
                  <admin-link
                    href={`/admin/products/${product.id.split('/').pop()}`}
                  >
                    <admin-text fontWeight="bold">{product.title}</admin-text>
                  </admin-link>

                  <admin-stack direction="horizontal" gap="small-500">
                    <admin-badge
                      status={
                        product.status === 'ACTIVE' ? 'success' : 'info'
                      }
                    >
                      {product.status}
                    </admin-badge>

                    {product.totalInventory !== null && (
                      <admin-text appearance="subdued">
                        {product.totalInventory} in stock
                      </admin-text>
                    )}
                  </admin-stack>
                </admin-stack>

                <admin-text fontWeight="bold">
                  {product.priceRangeV2?.minVariantPrice?.amount}{' '}
                  {product.priceRangeV2?.minVariantPrice?.currencyCode}
                </admin-text>
              </admin-stack>
            </admin-card>
          ))}
        </admin-stack>
      </admin-stack>
    </admin-block>
  );
}
