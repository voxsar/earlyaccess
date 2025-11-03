@extends('shopify-app::layouts.default')

@section('content')
    <!-- You are: (shop domain name) -->
    <p>You are: {{ $shopDomain ?? Auth::user()->name }}</p>

    <ui-title-bar title="Wishlist Admin Dashboard">
        <button onclick="showView('customers')" variant="secondary" id="customers-btn">
            View Customers
        </button>
        <button onclick="showView('products')" variant="primary" id="products-btn">
            View Products
        </button>
    </ui-title-bar>

    <!-- Loading Spinner -->
    <div id="loading-spinner" style="display: none; text-align: center; padding: 40px;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2196f3; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 16px; color: #666;">Loading data...</p>
    </div>

    <!-- Dashboard Overview -->
    <div id="dashboard-view" class="view-container" style="padding: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <!-- Customers Card -->
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-right: 12px;">
                        <span style="font-size: 24px;">👥</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Customers</h3>
                        <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">View customers with wishlist items</p>
                    </div>
                </div>
                <button onclick="showView('customers')" 
                   style="background: #2196f3; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; font-size: 14px;">
                    View All Customers
                </button>
            </div>

            <!-- Products Card -->
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                    <div style="background: #f3e5f5; padding: 12px; border-radius: 8px; margin-right: 12px;">
                        <span style="font-size: 24px;">🛍️</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Products</h3>
                        <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;">View all wishlisted products</p>
                    </div>
                </div>
                <button onclick="showView('products')" 
                   style="background: #9c27b0; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; font-size: 14px;">
                    View All Products
                </button>
            </div>
        </div>

        <!-- Quick Stats -->
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; margin-top: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Quick Overview</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">
                This dashboard allows you to manage and view wishlist data from your Shopify store. 
                Customers and products are automatically synced when wishlist actions are performed through the API.
            </p>
            <div style="margin-top: 16px;">
                <a href="https://partners.shopify.com/organizations" target="_blank" 
                   style="color: #2196f3; text-decoration: none; font-size: 14px; margin-right: 20px;">
                    Shopify Partners →
                </a>
                <a href="https://help.shopify.com/en/api" target="_blank" 
                   style="color: #2196f3; text-decoration: none; font-size: 14px;">
                    API Documentation →
                </a>
            </div>
        </div>
    </div>

    <!-- Customers View -->
    <div id="customers-view" class="view-container" style="display: none; padding: 20px;">
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 20px; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0; font-size: 18px; font-weight: 600;">
                        Customers with Wishlist Items (<span id="customers-count">0</span>)
                    </h2>
                </div>
                <div>
                    <button onclick="showView('dashboard')" style="background: #666; color: white; padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; margin-right: 8px;">
                        ← Back to Dashboard
                    </button>
                    <button onclick="refreshCustomers()" style="background: #4caf50; color: white; padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer;">
                        Refresh
                    </button>
                </div>
            </div>
            <div id="customers-content"></div>
        </div>
    </div>

    <!-- Products View -->
    <div id="products-view" class="view-container" style="display: none; padding: 20px;">
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 20px; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0; font-size: 18px; font-weight: 600;">
                        All Wishlisted Products (<span id="products-count">0</span>)
                    </h2>
                    <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
                        Products that have been added to customer wishlists, sorted by popularity
                    </p>
                </div>
                <div>
                    <button onclick="showView('dashboard')" style="background: #666; color: white; padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; margin-right: 8px;">
                        ← Back to Dashboard
                    </button>
                    <button onclick="refreshProducts()" style="background: #4caf50; color: white; padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer;">
                        Refresh
                    </button>
                </div>
            </div>
            <div id="products-content"></div>
        </div>
    </div>

    <!-- Customer Wishlist Modal -->
    <div id="wishlist-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000;">
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 8px; max-width: 90%; max-height: 90%; overflow: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="padding: 20px; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: white;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Customer Wishlist</h3>
                <button onclick="closeWishlistModal()" style="background: #f44336; color: white; padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer;">
                    Close
                </button>
            </div>
            <div id="wishlist-content" style="padding: 20px; min-width: 600px;"></div>
        </div>
    </div>

    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .view-container {
            animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #666;
        }
    </style>

    <script>
        let currentView = 'dashboard';
        let customersData = null;
        let productsData = null;
        let shopDomain = '';

        // Show loading spinner
        function showLoading() {
            document.getElementById('loading-spinner').style.display = 'block';
        }

        // Hide loading spinner
        function hideLoading() {
            document.getElementById('loading-spinner').style.display = 'none';
        }

        // Show specific view
        function showView(view) {
            // Hide all views
            const views = document.querySelectorAll('.view-container');
            views.forEach(v => v.style.display = 'none');
            
            // Show selected view
            document.getElementById(view + '-view').style.display = 'block';
            currentView = view;
            
            // Load data if needed
            if (view === 'customers' && !customersData) {
                loadCustomers();
            } else if (view === 'products' && !productsData) {
                loadProducts();
            }
        }

        // Load customers data
        function loadCustomers() {
            showLoading();
            fetch('/api/customers-data')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    customersData = data;
                    shopDomain = data.shopDomain;
                    renderCustomers();
                    hideLoading();
                })
                .catch(error => {
                    console.error('Error loading customers:', error);
                    hideLoading();
                    document.getElementById('customers-content').innerHTML = `
                        <div class="empty-state">
                            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Error loading customers</h3>
                            <p style="margin: 0; margin-bottom: 16px;">There was an error loading the customers data.</p>
                            <button onclick="refreshCustomers()" style="background: #2196f3; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer;">
                                Try Again
                            </button>
                        </div>
                    `;
                });
        }

        // Load products data
        function loadProducts() {
            showLoading();
            fetch('/api/products-data')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    productsData = data;
                    shopDomain = data.shopDomain;
                    renderProducts();
                    hideLoading();
                })
                .catch(error => {
                    console.error('Error loading products:', error);
                    hideLoading();
                    document.getElementById('products-content').innerHTML = `
                        <div class="empty-state">
                            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Error loading products</h3>
                            <p style="margin: 0; margin-bottom: 16px;">There was an error loading the products data.</p>
                            <button onclick="refreshProducts()" style="background: #2196f3; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer;">
                                Try Again
                            </button>
                        </div>
                    `;
                });
        }

        // Render customers table
        function renderCustomers() {
            const container = document.getElementById('customers-content');
            const countElement = document.getElementById('customers-count');
            
            if (!customersData || customersData.customers.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div style="font-size: 48px; margin-bottom: 16px;">📋</div>
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No customers with wishlist items yet</h3>
                        <p style="margin: 0;">When customers add products to their wishlist, they'll appear here.</p>
                    </div>
                `;
                countElement.textContent = '0';
                return;
            }

            countElement.textContent = customersData.customers.length;

            let html = `
                <div style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr style="background-color: #f9f9f9;">
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Customer</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Email</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Wishlist Count</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            customersData.customers.forEach(customer => {
                html += `
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 12px;">
                            <div style="font-weight: 500;">${customer.name || 'N/A'}</div>
                            <div style="font-size: 12px; color: #666; margin-top: 2px;">ID: ${customer.shopify_customer_id}</div>
                        </td>
                        <td style="padding: 12px;">${customer.email}</td>
                        <td style="padding: 12px; text-align: center;">
                            <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                ${customer.wishlist_count}
                            </span>
                        </td>
                        <td style="padding: 12px; text-align: center;">
                            <div style="display: flex; gap: 8px; justify-content: center;">
                                <button onclick="viewCustomerWishlist(${customer.id})" 
                                       style="background: #4caf50; color: white; padding: 6px 12px; border-radius: 4px; border: none; cursor: pointer; font-size: 12px;">
                                    View Wishlist
                                </button>
                                <a href="https://admin.shopify.com/store/${shopDomain}/customers/${customer.shopify_customer_id}" 
                                   target="_blank"
                                   style="background: #2196f3; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; display: inline-block;">
                                    View in Shopify
                                </a>
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table></div>';
            container.innerHTML = html;
        }

        // Render products table
        function renderProducts() {
            const container = document.getElementById('products-content');
            const countElement = document.getElementById('products-count');
            
            if (!productsData || productsData.products.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div style="font-size: 48px; margin-bottom: 16px;">🛍️</div>
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No products in wishlists yet</h3>
                        <p style="margin: 0;">When customers add products to their wishlist, they'll appear here.</p>
                    </div>
                `;
                countElement.textContent = '0';
                return;
            }

            countElement.textContent = productsData.products.length;

            let html = `
                <div style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr style="background-color: #f9f9f9;">
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Product Name</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Shopify ID</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Customer Count</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Popularity</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            productsData.products.forEach((product, index) => {
                const popularityLevel = product.customer_count >= 10 ? 'high' : (product.customer_count >= 5 ? 'medium' : 'low');
                const popularityColor = popularityLevel === 'high' ? '#4caf50' : (popularityLevel === 'medium' ? '#ff9800' : '#2196f3');
                const popularityLabel = popularityLevel === 'high' ? 'High' : (popularityLevel === 'medium' ? 'Medium' : 'Low');

                html += `
                    <tr style="border-bottom: 1px solid #f0f0f0;">
                        <td style="padding: 12px;">
                            <div style="display: flex; align-items: center;">
                                ${index < 3 ? `<span style="background: gold; color: #000; padding: 2px 6px; border-radius: 12px; font-size: 10px; font-weight: bold; margin-right: 8px; min-width: 20px; text-align: center;">${index + 1}</span>` : ''}
                                <div style="font-weight: 500;">${product.product_name || 'Unknown Product'}</div>
                            </div>
                        </td>
                        <td style="padding: 12px; text-align: center;">
                            <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${product.product_shopify_id}</code>
                        </td>
                        <td style="padding: 12px; text-align: center;">
                            <span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                ${product.customer_count} customer${product.customer_count !== 1 ? 's' : ''}
                            </span>
                        </td>
                        <td style="padding: 12px; text-align: center;">
                            <span style="background: ${popularityColor}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">
                                ${popularityLabel}
                            </span>
                        </td>
                        <td style="padding: 12px; text-align: center;">
                            <a href="https://admin.shopify.com/store/${shopDomain}/products/${product.product_shopify_id}" 
                               target="_blank"
                               style="background: #2196f3; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                                View in Shopify
                            </a>
                        </td>
                    </tr>
                `;
            });

            html += '</tbody></table></div>';

            // Add summary stats
            const totalItems = productsData.products.reduce((sum, product) => sum + product.customer_count, 0);
            const avgPerProduct = productsData.products.length > 0 ? (totalItems / productsData.products.length).toFixed(1) : 0;

            html += `
                <div style="padding: 20px; border-top: 1px solid #e5e5e5; background-color: #f9f9f9;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #2196f3;">${productsData.products.length}</div>
                            <div style="font-size: 14px; color: #666;">Total Products</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #4caf50;">${totalItems}</div>
                            <div style="font-size: 14px; color: #666;">Total Wishlist Items</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold; color: #ff9800;">${avgPerProduct}</div>
                            <div style="font-size: 14px; color: #666;">Avg. per Product</div>
                        </div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        }

        // View customer wishlist in modal
        function viewCustomerWishlist(customerId) {
            showLoading();
            fetch(`/api/customer-wishlist/${customerId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    renderWishlistModal(data);
                    document.getElementById('wishlist-modal').style.display = 'block';
                    hideLoading();
                })
                .catch(error => {
                    console.error('Error loading customer wishlist:', error);
                    hideLoading();
                    document.getElementById('wishlist-content').innerHTML = `
                        <div class="empty-state">
                            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                            <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Error loading wishlist</h3>
                            <p style="margin: 0;">There was an error loading the customer's wishlist.</p>
                        </div>
                    `;
                    document.getElementById('wishlist-modal').style.display = 'block';
                });
        }

        // Render wishlist modal content
        function renderWishlistModal(data) {
            const container = document.getElementById('wishlist-content');
            const customer = data.customer;

            let html = `
                <div style="margin-bottom: 20px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
                    <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${customer.name || 'Customer'}</h4>
                    <p style="margin: 0; color: #666;">${customer.email} • ${customer.wishlist_count} item${customer.wishlist_count !== 1 ? 's' : ''} in wishlist</p>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Shopify Customer ID: ${customer.shopify_customer_id}</p>
                </div>
            `;

            if (customer.wishlists && customer.wishlists.length > 0) {
                html += `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f9f9f9;">
                                <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Product</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Shopify ID</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Added Date</th>
                                <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e5e5; font-weight: 600;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                customer.wishlists.forEach(item => {
                    const addedDate = new Date(item.created_at);
                    html += `
                        <tr style="border-bottom: 1px solid #f0f0f0;">
                            <td style="padding: 12px;">
                                <div style="font-weight: 500;">${item.product_name}</div>
                            </td>
                            <td style="padding: 12px; text-align: center;">
                                <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${item.product_shopify_id}</code>
                            </td>
                            <td style="padding: 12px; text-align: center;">
                                <div style="font-size: 13px;">${addedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                <div style="font-size: 11px; color: #666;">${addedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                            </td>
                            <td style="padding: 12px; text-align: center;">
                                <a href="https://admin.shopify.com/store/${data.shopDomain}/products/${item.product_shopify_id}" 
                                   target="_blank"
                                   style="background: #2196f3; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px;">
                                    View in Shopify
                                </a>
                            </td>
                        </tr>
                    `;
                });

                html += '</tbody></table>';
            } else {
                html += `
                    <div class="empty-state">
                        <div style="font-size: 48px; margin-bottom: 16px;">💝</div>
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">No wishlist items</h3>
                        <p style="margin: 0;">This customer hasn't added any products to their wishlist yet.</p>
                    </div>
                `;
            }

            container.innerHTML = html;
        }

        // Close wishlist modal
        function closeWishlistModal() {
            document.getElementById('wishlist-modal').style.display = 'none';
        }

        // Refresh functions
        function refreshCustomers() {
            customersData = null;
            loadCustomers();
        }

        function refreshProducts() {
            productsData = null;
            loadProducts();
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            showView('dashboard');
        });

        // Close modal when clicking outside
        document.getElementById('wishlist-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeWishlistModal();
            }
        });
    </script>
@endsection