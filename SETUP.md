# Setup Guide - Early Access + Wishlist App

This guide walks you through setting up the app from scratch.

## Prerequisites

Before you begin, ensure you have:

1. **Shopify Partner Account**
   - Sign up at https://partners.shopify.com if you don't have one
   - Access to Shopify Partner Dashboard

2. **Development Store**
   - Create a development store from Partner Dashboard
   - Populate with test data (recommended)
   - Enable checkout on the development store

3. **Required Software**
   - Node.js 18 or higher
   - npm or yarn package manager
   - Git

4. **Shopify CLI**
   ```bash
   npm install -g @shopify/cli
   ```

## Step-by-Step Setup

### 1. Create App in Partner Dashboard

1. Log in to [Shopify Partner Dashboard](https://partners.shopify.com)
2. Navigate to Apps
3. Click "Create app"
4. Choose "Create app manually"
5. Fill in app details:
   - **App name**: Early Access Wishlist
   - **App URL**: https://shopify.dev/apps/default-app-home (temporary)
6. Save and note your **Client ID**

### 2. Configure App Credentials

1. Open `shopify.app.toml` in the project root
2. Update the following fields:
   ```toml
   name = "earlyaccess-wishlist"
   client_id = "YOUR_CLIENT_ID_HERE"  # From Partner Dashboard
   ```

3. Set your development store URL:
   ```toml
   [build]
   dev_store_url = "your-store.myshopify.com"
   ```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install customer account extension dependencies
cd extensions/wishlist-customer-account
npm install
cd ../..

# Install admin extension dependencies
cd extensions/wishlist-admin
npm install
cd ../..
```

### 4. Configure App in Partner Dashboard

#### Set Access Scopes

1. Go to your app in Partner Dashboard
2. Navigate to "Configuration" > "App setup"
3. In "Admin API access scopes", add:
   - `read_customers`
   - `write_customers`
   - `read_products`
   - `write_products`
   - `read_discounts`
   - `write_discounts`
   - `read_metaobjects`
   - `write_metaobjects`

#### Set App URLs

1. In "Configuration" > "App setup"
2. Set **App URL**: `https://shopify.dev/apps/default-app-home`
3. Add **Allowed redirection URLs**:
   - `https://shopify.dev/apps/default-app-home/api/auth`
   - `https://shopify.dev/apps/default-app-home/api/auth/callback`
   - `https://earlyaccessapi.dev.artslabcreatives.com/api/auth/callback`

### 5. Start Development Server

```bash
npm run dev
```

This command will:
1. Start the Shopify CLI development server
2. Provide a preview URL
3. Tunnel your local app to Shopify
4. Hot-reload on file changes

### 6. Install App on Development Store

1. When prompted by CLI, select your development store
2. Click the installation link provided by CLI
3. Review permissions and click "Install app"
4. App will be installed on your development store

### 7. Configure Theme Extension

#### Add Wishlist Button to Product Page

1. Go to your development store admin
2. Navigate to **Online Store > Themes**
3. Click **Customize** on your active theme
4. Navigate to a product page
5. Click **Add block** or **Add section**
6. Under **Apps**, find "Add to Wishlist"
7. Add the block below the "Add to Cart" button
8. Configure button settings:
   - Button text
   - Icon visibility
   - Button style
   - Colors
9. Click **Save**

### 8. Test Customer Account Extension

#### Create Test Customer

1. In your store admin, go to **Customers**
2. Click **Add customer**
3. Fill in details and enable "Customer accounts"
4. Save customer

#### Preview Extension

1. In terminal where `shopify app dev` is running
2. Press `p` to open developer console
3. Click preview link for customer account extension
4. Log in with test customer credentials
5. Navigate to profile to see wishlist link
6. Click "View Wishlist" to see full page

### 9. Test Admin Extension

1. Go to your development store admin
2. Navigate to **Customers**
3. Click on any customer
4. Scroll down to see "Customer Wishlist" block
5. Add products to a customer's wishlist (using storefront)
6. Refresh customer page to see wishlist appear

### 10. Test Wishlist Functionality

#### From Storefront

1. Open your store's online store (storefront)
2. Log in as a test customer
3. Navigate to a product page
4. Click "Add to Wishlist" button
5. Verify button changes to "Added to Wishlist"
6. Heart icon should fill with color

#### From Customer Account

1. Log in to customer account
2. Navigate to profile
3. Click "View Wishlist"
4. Verify product appears in grid
5. Test "Remove" button
6. Verify product is removed

#### From Admin

1. Go to **Customers** in admin
2. Select customer who has wishlist items
3. View "Customer Wishlist" block
4. Verify products are listed with details

## Development Workflow

### Making Changes

1. **Theme Extension Changes** (CSS/JS/Liquid)
   - Edit files in `extensions/wishlist-button-theme/`
   - Changes auto-reload in theme editor
   - Test in theme customizer

2. **Customer Account Extension Changes**
   - Edit files in `extensions/wishlist-customer-account/src/`
   - Save to trigger hot reload
   - Preview in customer account

3. **Admin Extension Changes**
   - Edit files in `extensions/wishlist-admin/src/`
   - Save to trigger rebuild
   - Refresh admin page to see changes

### Debugging

#### Theme Extension
- Use browser DevTools console
- Check Network tab for API calls
- Inspect localStorage for wishlist data

#### Customer Account Extension
- Use browser DevTools console
- Check React/Preact DevTools
- Review API responses in Network tab

#### Admin Extension
- Use browser DevTools console
- Check admin GraphQL responses
- Review extension logs

### Common Issues

#### "App not found" error
- Ensure `client_id` in `shopify.app.toml` is correct
- Verify app exists in Partner Dashboard
- Try `shopify app info` to verify configuration

#### Extensions not showing
- Ensure `shopify app dev` is running
- Check that app is installed on store
- Verify extension targets are correct
- Try refreshing or hard reload (Ctrl+Shift+R)

#### Metafield not saving
- Verify access scopes are granted
- Check metafield definition is created
- Review API response for errors
- Ensure correct namespace and key

#### CSS not applying
- Clear browser cache
- Check CSS file is linked in Liquid schema
- Verify CSS selector specificity
- Inspect element to see applied styles

## Deployment

### Creating a Version

Once development is complete and tested:

```bash
npm run deploy
```

This will:
1. Build all extensions
2. Create a new app version
3. Upload to Shopify
4. Provide version number

### Releasing to Users

1. Go to Partner Dashboard
2. Navigate to your app
3. Go to "Versions"
4. Find your new version
5. Click "Release"
6. Confirm release

The new version will be pushed to all stores with your app installed.

### Going to Production

To make your app available to all merchants:

1. **Build App Home Page**
   - Create an embedded app interface
   - Add configuration options for merchants
   - Provide onboarding and documentation

2. **Update App URLs**
   - Deploy your app to a hosting service
   - Update `application_url` in `shopify.app.toml`
   - Update redirect URLs in Partner Dashboard

3. **Submit for Review**
   - Go to Partner Dashboard
   - Submit app for App Store review
   - Address any feedback from Shopify

## Next Steps

After basic setup:

1. **Customize Appearance**
   - Modify CSS to match your brand
   - Adjust button styles and colors
   - Customize empty states

2. **Add Features**
   - Implement early access pages
   - Add discount functionality
   - Build analytics dashboard

3. **Enhance UX**
   - Add email notifications
   - Implement wishlist sharing
   - Add product recommendations

4. **Testing**
   - Test on multiple themes
   - Test with various product types
   - Test edge cases (out of stock, etc.)

5. **Documentation**
   - Create merchant documentation
   - Add help text in app
   - Create video tutorials

## Support Resources

- [Shopify Dev Docs](https://shopify.dev)
- [UI Extensions Documentation](https://shopify.dev/docs/api/customer-account-ui-extensions)
- [Theme App Extensions](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions)
- [Shopify Community Forums](https://community.shopify.com)

## Getting Help

If you encounter issues:

1. Check this setup guide
2. Review README.md troubleshooting section
3. Check browser console for errors
4. Review Shopify CLI logs
5. Search Shopify dev docs
6. Ask in Shopify Community forums

## Congratulations!

You've successfully set up the Early Access + Wishlist app. Your app is now ready for development and testing!
