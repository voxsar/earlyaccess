# Admin Dashboard Documentation

## Overview
The admin dashboard provides comprehensive analytics and insights for wishlist activity in your Shopify store. This feature allows merchants to track customer engagement, monitor popular products, and analyze wishlist trends over time.

## Features

### 1. Date Range Selector
- **Location**: Top of dashboard
- **Functionality**: Filter all dashboard data by custom date ranges
- **Presets**: 
  - Today
  - This Week
  - This Month
  - Custom range selector

### 2. Insights Cards
Four key metric cards displaying:

#### Wishlist Additions
- Total number of products added to wishlists in the selected date range
- Updates dynamically based on date range

#### Inventory Metrics
- **Low stock**: Count of products with low inventory (placeholder for future implementation)
- **Products on sale**: Count of products currently on sale (placeholder for future implementation)

#### Cart Metrics
- **Count**: Number of products added to cart (placeholder for future implementation)
- **Value**: Total monetary value of cart additions (placeholder for future implementation)

### 3. Activity Statistics Chart
- **Type**: Line chart
- **Data**: Shows wishlist additions vs. removals over time
- **Granularity**: Grouped by day
- **Library**: Chart.js
- **Colors**: 
  - Green line for additions
  - Red line for removals

### 4. Top Products Table
- Lists products with the most wishlist additions
- Columns:
  - Product name
  - Number of additions
- Sorted by addition count (descending)
- Default limit: 10 items

### 5. Top Customers Table
- Lists customers with the most wishlist additions
- Columns:
  - Customer name
  - Customer email
  - Number of additions
- Sorted by addition count (descending)
- Default limit: 10 items

### 6. Recent Activity Feed
- Real-time feed of wishlist activities
- Shows:
  - Customer name
  - Action (created wishlist, added, or removed)
  - Product name
  - Relative timestamp (e.g., "2 days ago")
- Visual indicators:
  - ➕ Green for additions and new wishlist creation
  - ➖ Red for removals
- Default limit: 20 items

## Technical Implementation

### Database Schema

#### `wishlist_activities` Table
```sql
CREATE TABLE wishlist_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id BIGINT,
    product_shopify_id VARCHAR(255),
    product_name VARCHAR(255),
    activity_type ENUM('add', 'remove', 'create_new'),
    metadata TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(customer_id, created_at),
    INDEX(activity_type)
);
```

### API Endpoints

All endpoints require authentication via the `verify.shopify` middleware.

#### 1. Get Dashboard Insights
```
GET /api/dashboard/insights?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

**Response:**
```json
{
    "success": true,
    "data": {
        "wishlistAdditions": 42,
        "productsAddedToCart": {
            "count": 0,
            "value": 0
        },
        "lowStock": 0,
        "productsOnSale": 0,
        "dateRange": {
            "start": "2025-11-01",
            "end": "2025-11-30"
        }
    }
}
```

#### 2. Get Top Products
```
GET /api/dashboard/top-products?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&limit=10
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "product_shopify_id": "2000",
            "product_name": "Awesome T-Shirt",
            "additions_count": 15
        }
    ]
}
```

#### 3. Get Top Customers
```
GET /api/dashboard/top-customers?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&limit=10
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "customer_id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "additions_count": 8
        }
    ]
}
```

#### 4. Get Activity Statistics
```
GET /api/dashboard/activity-stats?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&group_by=day
```

**Parameters:**
- `group_by`: `day`, `week`, or `month`

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "date": "2025-11-01",
            "add": 5,
            "remove": 2,
            "create_new": 1
        }
    ]
}
```

#### 5. Get Recent Activities
```
GET /api/dashboard/recent-activities?limit=20
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "product_name": "Awesome T-Shirt",
            "activity_type": "add",
            "created_at": "2025-11-03 20:54:54",
            "human_time": "2 hours ago"
        }
    ]
}
```

### Activity Tracking

The system automatically tracks three types of wishlist activities:

1. **create_new**: First product added to a customer's wishlist
2. **add**: Additional products added to an existing wishlist
3. **remove**: Products removed from a wishlist

Activity tracking is implemented in `WishlistService::trackActivity()` and is called automatically when:
- A customer adds a product to their wishlist
- A customer removes a product from their wishlist

### Frontend Integration

The dashboard UI is built with vanilla JavaScript and includes:
- Chart.js for data visualization
- Async/await for API calls
- Responsive card-based layout
- Real-time data refresh on date range change

### Files Modified/Created

#### New Files:
- `app/Models/WishlistActivity.php` - Activity model
- `app/Http/Controllers/AdminDashboardController.php` - Dashboard controller
- `database/migrations/2025_11_03_204524_create_wishlist_activities_table.php` - Activity table migration
- `database/seeders/DashboardTestSeeder.php` - Test data seeder
- `ADMIN_DASHBOARD.md` - This documentation

#### Modified Files:
- `app/Services/WishlistService.php` - Added activity tracking
- `app/Models/Customer.php` - Added activities relationship
- `resources/views/welcome.blade.php` - Enhanced dashboard UI
- `routes/web.php` - Added dashboard routes

## Usage

### Accessing the Dashboard
Navigate to the root URL of your application (/) to view the main dashboard.

### Filtering Data
1. Use the date range selectors at the top
2. Click one of the preset buttons (Today, This Week, This Month)
3. Click "Apply" to refresh all dashboard data

### Testing with Sample Data
Run the test seeder to populate the dashboard with sample data:
```bash
php artisan db:seed --class=DashboardTestSeeder
```

## Future Enhancements

The following features are placeholders and can be implemented:

1. **Low Stock Tracking**: Integrate with Shopify inventory API
2. **Products on Sale**: Track products with active discounts
3. **Cart Analytics**: Track products added to cart from wishlist
4. **Export Functionality**: Export dashboard data to CSV/Excel
5. **Email Notifications**: Alert merchants about popular products
6. **Product Images**: Display product thumbnails in tables
7. **Customer Segmentation**: Group customers by wishlist behavior

## Performance Considerations

- All queries use database indexes for optimal performance
- Activities are tracked asynchronously (doesn't slow down API responses)
- Date-based queries are optimized with proper indexing
- Chart data is grouped to reduce payload size

## Security

- All endpoints require Shopify authentication
- Data is scoped to the authenticated shop
- SQL injection protection via Laravel's query builder
- XSS protection via Blade templating

## Support

For issues or questions, please refer to the main README.md or contact support.
