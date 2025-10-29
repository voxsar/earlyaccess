import {
  reactExtension,
  BlockStack,
  InlineStack,
  Heading,
  Text,
  Button,
} from '@shopify/ui-extensions-react/customer-account';

export default reactExtension(
  'customer-account.profile.block.render',
  () => (
    <InlineStack spacing="base">
      <BlockStack spacing="tight">
        <Heading>My Wishlist</Heading>
        <Text appearance="subdued">View and manage your favorite products</Text>
      </BlockStack>
      <Button to="extension:wishlist-fullpage/">View Wishlist</Button>
    </InlineStack>
  )
);
