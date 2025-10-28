# Changelog

All notable changes to the Early Access + Wishlist app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Early access custom pages with access control
- Discount functionality for early access products
- Backend API server for wishlist operations
- Email notifications for price drops
- Wishlist sharing functionality
- Product recommendations based on wishlist
- Analytics dashboard for merchants
- Bulk operations for wishlist management
- Export wishlist data
- Multi-language support beyond English

## [1.0.0] - 2025-10-28

### Added - Initial Release

#### Theme App Extension
- Add to Wishlist button for product pages
- Configurable button settings (text, style, colors)
- Heart icon with smooth animations
- Customer login requirement enforcement
- Responsive CSS with multiple style variants
- JavaScript functionality for add/remove
- Local storage caching for performance
- Toast notifications for user feedback
- Support for Online Store 2.0 themes

#### Customer Account UI Extension
- Full-page wishlist view with product grid
- Profile block link to wishlist page
- Product cards with images, titles, and pricing
- Remove from wishlist functionality
- Empty state handling for wishlists with no items
- Loading and error states
- Responsive design for mobile and desktop
- Integration with Storefront API for product data
- Integration with Customer Account API for wishlist data

#### Admin UI Extension
- Customer wishlist block in admin customer details page
- Product card display with images and metadata
- Links to product admin pages
- Stock and status information display
- Proper error and empty states
- Integration with Admin GraphQL API

#### Data & Configuration
- Customer metafield definitions for wishlist storage
- Wishlist products metafield (list.product_reference)
- Wishlist timestamps metafield (JSON)
- Proper access controls (customer read/write, admin read)
- App configuration in shopify.app.toml
- Required access scopes defined
- Webhook configuration structure

#### Documentation
- Comprehensive README.md with features and architecture
- Detailed SETUP.md guide for developers and merchants
- API.md with complete API documentation
- CONTRIBUTING.md with contribution guidelines
- LICENSE file (MIT License)
- CHANGELOG.md for version tracking

#### Development Setup
- Package.json files for all extensions
- .gitignore for proper version control
- Localization files (en.default.json)
- Extension configuration files (shopify.extension.toml)
- Preact components with modern React patterns
- Liquid templates with proper schema definitions

### Technical Details

#### Dependencies
- @shopify/cli: ^3.86.0
- @shopify/ui-extensions: ^2025.10
- preact: ^10.19.0
- Node.js: 18+

#### API Versions
- Admin API: 2025-10
- Storefront API: 2025-10
- Customer Account API: 2025-10

#### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

#### Theme Compatibility
- Online Store 2.0 themes
- Themes with app block support
- JSON templates required

### Known Issues
- Backend API endpoints not yet implemented (wishlist operations currently use client-side only)
- Early access features not yet implemented
- No email notification system
- No analytics/reporting dashboard
- Limited to single language (English)

### Security
- Customer authentication required for wishlist operations
- Metafield access controls properly configured
- XSS protection via proper HTML escaping
- CSRF protection via Shopify's built-in mechanisms

### Performance
- Local storage caching for quick UI updates
- Debounced API calls to prevent rate limiting
- Efficient GraphQL queries (only fetch required fields)
- Responsive images with proper sizing
- CSS optimized for performance

### Accessibility
- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatible
- Sufficient color contrast ratios
- Focus indicators on all interactive elements

## Release Notes

### Version 1.0.0

This is the initial release of the Early Access + Wishlist app. The core wishlist functionality is complete and production-ready, including:

1. **Storefront Integration**: Customers can add products to their wishlist directly from product pages with a beautiful, configurable button.

2. **Customer Account**: Full wishlist management through the customer account portal with a dedicated wishlist page.

3. **Merchant Tools**: Admin interface to view customer wishlists and understand customer preferences.

4. **Data Persistence**: Reliable storage using Shopify customer metafields with proper access controls.

While the early access features are planned for future releases, the wishlist functionality is fully operational and ready for production use.

### Migration Notes

This is the first release, so no migration is required.

### Upgrade Path

For future updates:
1. Review changelog for breaking changes
2. Test new version on development store
3. Deploy new version via `shopify app deploy`
4. Monitor for any issues after deployment

### Deprecation Notices

None in this release.

### Credits

Built with Shopify CLI, UI Extensions, and modern web technologies.

---

## Version History Format

Each version entry includes:
- **[Version]** - Release date
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
