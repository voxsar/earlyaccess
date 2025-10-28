/**
 * Wishlist Customer Account Full Page Extension
 * Displays customer's wishlist with product cards and management features
 */

import '@shopify/ui-extensions/customer-account';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export default async () => {
  render(<WishlistPage />, document.body);
};

function WishlistPage() {
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
      const customerData = await shopify.query(
        `query {
          customer {
            id
            metafield(namespace: "app", key: "wishlist") {
              value
            }
          }
        }`
      );

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

      // Query Storefront API for product details
      const productsQuery = `
        query ($ids: [ID!]!) {
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

      const productsData = await shopify.query(productsQuery, {
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
      const customerData = await shopify.query(
        `query {
          customer {
            id
            metafield(namespace: "app", key: "wishlist") {
              value
            }
          }
        }`
      );

      const customerId = customerData?.data?.customer?.id;
      const currentWishlist = JSON.parse(
        customerData?.data?.customer?.metafield?.value || '[]'
      );

      // Remove product from wishlist
      const updatedWishlist = currentWishlist.filter(
        (id) => id !== productId
      );

      // Update metafield via Customer Account API
      await shopify.query(
        `mutation UpdateWishlist($customerId: ID!, $metafields: [MetafieldsSetInput!]!) {
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
        }`,
        {
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
        }
      );

      // Update local state
      setWishlist(wishlist.filter((item) => item.id !== productId));

      // Dispatch event for other components
      window.dispatchEvent(
        new CustomEvent('wishlist:change', {
          detail: { action: 'removed', productId },
        })
      );
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Failed to remove item. Please try again.');
    } finally {
      setRemoveLoading({ loading: false, id: null });
    }
  }

  async function moveToCart(product) {
    try {
      // In a real implementation, this would add the product to cart
      // For now, we'll navigate to the product page
      window.location.href = product.onlineStoreUrl;
    } catch (err) {
      console.error('Error moving to cart:', err);
    }
  }

  if (loading) {
    return (
      <s-page heading="My Wishlist">
        <s-stack direction="block" gap="base" padding="base">
          <s-spinner size="large" />
          <s-text>Loading your wishlist...</s-text>
        </s-stack>
      </s-page>
    );
  }

  if (error) {
    return (
      <s-page heading="My Wishlist">
        <s-banner status="critical">
          <s-text>{error}</s-text>
        </s-banner>
      </s-page>
    );
  }

  if (wishlist.length === 0) {
    return (
      <s-page heading="My Wishlist">
        <s-stack direction="block" gap="base" padding="base" alignItems="center">
          <s-text size="large">Your wishlist is empty</s-text>
          <s-text color="subdued">
            Start adding products to your wishlist to keep track of items you love!
          </s-text>
          <s-button href="/" variant="primary">
            Continue Shopping
          </s-button>
        </s-stack>
      </s-page>
    );
  }

  return (
    <s-page heading="My Wishlist">
      <s-stack direction="block" gap="base" padding="base">
        <s-text color="subdued">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
        </s-text>

        <s-grid columns="3" gap="base">
          {wishlist.map((product) => (
            <s-section key={product.id}>
              <s-stack direction="block" gap="base">
                {product.featuredImage && (
                  <s-image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    aspectRatio="1/1"
                  />
                )}

                <s-stack direction="block" gap="small-500">
                  <s-text type="strong">{product.title}</s-text>

                  <s-text type="strong" size="large">
                    {shopify.i18n.formatCurrency(
                      product.priceRange.minVariantPrice.amount,
                      {
                        currency: product.priceRange.minVariantPrice.currencyCode,
                      }
                    )}
                  </s-text>

                  {!product.availableForSale && (
                    <s-badge status="critical">Out of Stock</s-badge>
                  )}
                </s-stack>

                <s-stack direction="inline" gap="small-500">
                  <s-button
                    slot="primary-action"
                    href={product.onlineStoreUrl}
                    variant="primary"
                  >
                    View Product
                  </s-button>

                  <s-button
                    slot="secondary-actions"
                    loading={
                      removeLoading.loading && product.id === removeLoading.id
                    }
                    onClick={() => removeFromWishlist(product.id)}
                    variant="tertiary"
                  >
                    Remove
                  </s-button>
                </s-stack>
              </s-stack>
            </s-section>
          ))}
        </s-grid>
      </s-stack>
    </s-page>
  );
}
