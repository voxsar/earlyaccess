# Wishlist Button Positioning Examples

The new positioning system uses direct CSS values for maximum flexibility. You can now position the floating wishlist button anywhere on the screen using the following settings:

## Position Settings

### Basic Positioning
- **Top Position**: Distance from top edge (e.g., `50` for 50px from top)
- **Bottom Position**: Distance from bottom edge (e.g., `50` for 50px from bottom) 
- **Left Position**: Distance from left edge (e.g., `20` for 20px from left)
- **Right Position**: Distance from right edge (e.g., `20` for 20px from right)

### Negative Values Supported
You can now use negative values to position the button partially off-screen:
- **Top**: `-10` (10px above the viewport)
- **Left**: `-20` (20px to the left of the viewport)
- **Right**: `-15` (15px beyond the right edge)
- **Bottom**: `-5` (5px below the viewport)

## Common Positioning Examples

### Top Left Corner
- Top: `20`
- Left: `20`
- Right: (leave blank)
- Bottom: (leave blank)

### Top Right Corner  
- Top: `20`
- Right: `20`
- Left: (leave blank)
- Bottom: (leave blank)

### Bottom Left Corner
- Bottom: `20` 
- Left: `20`
- Top: (leave blank)
- Right: (leave blank)

### Bottom Right Corner
- Bottom: `20`
- Right: `20`
- Top: (leave blank)
- Left: (leave blank)

### Center Left Edge
- Left: `20`
- Top: `50%` (use CSS calc if needed)
- Right: (leave blank)
- Bottom: (leave blank)

### Partially Hidden (Peek Effect)
- Right: `-30` (button extends 30px beyond right edge)
- Top: `50%`
- Left: (leave blank)
- Bottom: (leave blank)

## Important Notes

1. **Leave unused positions blank** - Only set the positions you want to use
2. **Conflicting positions** - Don't set both left AND right, or both top AND bottom at the same time
3. **Negative values** - Use carefully to avoid button being completely off-screen
4. **Units** - All values are in pixels (px)
5. **No rotation** - The button no longer rotates based on position, making it easier to read

## Login Functionality

The wishlist button is now always visible, even for non-logged customers. When they click it:
- **Logged users**: See their wishlist items
- **Non-logged users**: See a login prompt with Login and Create Account buttons

This improves user experience by making the wishlist feature discoverable to all visitors.