import { extension, InlineStack, BlockStack, Heading, Text, Button } from '@shopify/ui-extensions/customer-account';

export default extension('customer-account.profile.block.render', (root) => {
	root.render(
		root.createComponent(InlineStack, { spacing: 'base' }, [
			root.createComponent(BlockStack, { spacing: 'tight' }, [
				root.createComponent(Heading, {}, 'My Wishlist'),
				root.createComponent(Text, { appearance: 'subdued' }, 'View and manage your favorite products')
			]),
			root.createComponent(Button, { to: 'extension:wishlist-fullpage/' }, 'View Wishlist')
		])
	);
});
