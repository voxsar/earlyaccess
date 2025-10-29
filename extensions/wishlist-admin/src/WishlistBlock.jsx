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

export default reactExtension('admin.customer-details.block.render', () => <WishlistAdminBlock />);

function WishlistAdminBlock() {
  const { data, query } = useApi();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      const customerData = await query('query GetCustomerWishlist($customerId:ID!){customer(id:$customerId){id email firstName lastName metafield(namespace:"app",key:"wishlist"){value}}}', { variables: { customerId: customerId } });
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
      const productIds = JSON.parse(wishlistValue);
      if (!productIds || productIds.length === 0) {
        setWishlist([]);
        setLoading(false);
        return;
      }
      const productsData = await query('query GetProducts($ids:[ID!]!){nodes(ids:$ids){...on Product{id title handle status featuredImage{url altText}priceRangeV2{minVariantPrice{amount currencyCode}}totalInventory}}}', { variables: { ids: productIds } });
      setWishlist(productsData?.data?.nodes || []);
    } catch (err) {
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminBlock title="Customer Wishlist">
      {!customerId ? (
        <Text>No customer selected</Text>
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
            {wishlist.map((product) => (
              <BlockStack key={product.id} spacing="base" inlineAlignment="start">
                <InlineStack spacing="base" blockAlignment="center">
                  {product.featuredImage && <Image source={product.featuredImage.url} alt={product.featuredImage.altText || product.title} />}
                  <BlockStack spacing="base">
                    <Link url={`shopify://admin/products/${product.id.split('/').pop()}`}>
                      <Text fontWeight="bold">{product.title}</Text>
                    </Link>
                    <InlineStack spacing="base">
                      <Badge tone={product.status === 'ACTIVE' ? 'success' : 'info'}>{product.status}</Badge>
                      {product.totalInventory !== null && <Text tone="subdued">{product.totalInventory} in stock</Text>}
                    </InlineStack>
                    <Text fontWeight="bold">{product.priceRangeV2?.minVariantPrice?.amount} {product.priceRangeV2?.minVariantPrice?.currencyCode}</Text>
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
