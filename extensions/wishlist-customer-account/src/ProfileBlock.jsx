/**
 * Wishlist Profile Block Extension
 * Displays a link to the wishlist page on the customer profile
 */

/** @jsxImportSource preact */
import '@shopify/ui-extensions/customer-account';
import { render } from 'preact';

export default async () => {
  render(<WishlistProfileBlock />, document.body);
};

function WishlistProfileBlock() {
  return (
    <s-section>
      <s-stack direction="inline" justifyContent="space-between" alignItems="center">
        <s-stack direction="block" gap="small-400">
          <s-heading>My Wishlist</s-heading>
          <s-text color="subdued">
            View and manage your favorite products
          </s-text>
        </s-stack>
        <s-button variant="primary" href="extension:wishlist-fullpage/">
          View Wishlist
        </s-button>
      </s-stack>
    </s-section>
  );
}
