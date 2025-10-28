# Contributing to Early Access + Wishlist App

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a new branch for your feature/fix
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## Development Setup

See [SETUP.md](./SETUP.md) for detailed setup instructions.

## Code Style

### JavaScript/JSX
- Use ES6+ syntax
- Use functional components with hooks
- Follow Preact best practices
- Use meaningful variable names
- Add comments for complex logic

### Liquid
- Use consistent indentation (2 spaces)
- Add comments for non-obvious code
- Follow Shopify Liquid best practices

### CSS
- Use BEM naming convention where applicable
- Keep selectors specific to avoid conflicts
- Use CSS custom properties for theming
- Make styles responsive

## Testing

Before submitting a PR:

1. **Theme Extension**
   - Test on multiple themes (Dawn, other OS 2.0 themes)
   - Test with logged-in and logged-out users
   - Test button functionality
   - Verify styles don't conflict with theme

2. **Customer Account Extension**
   - Test wishlist display with 0, 1, and many items
   - Test remove functionality
   - Test on mobile and desktop
   - Verify API calls work correctly

3. **Admin Extension**
   - Test with customers who have wishlists
   - Test with customers without wishlists
   - Verify product data displays correctly

## Pull Request Process

1. Update documentation if needed
2. Add/update tests if applicable
3. Ensure all tests pass
4. Update CHANGELOG.md with your changes
5. Submit PR with clear description of changes

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Changes tested thoroughly
```

## Feature Requests

To request a new feature:

1. Check existing issues to avoid duplicates
2. Open a new issue with "Feature Request" label
3. Provide:
   - Clear description of the feature
   - Use case / why it's needed
   - Proposed implementation (optional)

## Bug Reports

To report a bug:

1. Check existing issues to avoid duplicates
2. Open a new issue with "Bug" label
3. Provide:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Shopify version, theme, etc.)
   - Screenshots/console logs if applicable

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add product sorting to wishlist page
fix: Resolve button styling issue on mobile
docs: Update README with new configuration options
style: Format code with prettier
refactor: Simplify wishlist API calls
test: Add tests for remove functionality
```

Prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Code Review

All submissions require review. We will:
- Review code quality and style
- Test functionality
- Verify documentation is updated
- Check for breaking changes

Please be patient and responsive to feedback.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
