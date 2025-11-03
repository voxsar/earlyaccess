@extends('shopify-app::layouts.default')

@section('content')
    <!-- You are: (shop domain name) -->
    <p>You are: {{ $shopDomain ?? Auth::user()->name }}</p>

    <ui-title-bar title="Wishlist Admin Dashboard">
        <button onclick="location.href='{{ route('products.index') }}'" variant="secondary">
            View Products
        </button>
        <button onclick="location.href='{{ route('customers.index') }}'" variant="primary">
            View Customers
        </button>
    </ui-title-bar>

    <div style="padding: 20px;">
        <!-- Date Range Selector -->
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                <div>
                    <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500;">Start Date</label>
                    <input type="date" id="startDate" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 4px; font-size: 14px; font-weight: 500;">End Date</label>
                    <input type="date" id="endDate" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                </div>
                <div style="align-self: flex-end;">
                    <button onclick="refreshDashboard()" style="background: #2196f3; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                        Apply
                    </button>
                </div>
                <div style="align-self: flex-end;">
                    <button onclick="setDateRange('today')" style="background: #757575; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; margin-right: 4px;">
                        Today
                    </button>
                    <button onclick="setDateRange('week')" style="background: #757575; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; margin-right: 4px;">
                        This Week
                    </button>
                    <button onclick="setDateRange('month')" style="background: #757575; color: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
                        This Month
                    </button>
                </div>
            </div>
        </div>

        <!-- Insights This Month Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <!-- Wishlist Additions Card -->
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; margin-right: 12px;">
                        <span style="font-size: 24px;">❤️</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 14px; color: #666;">Wishlist Additions</h3>
                    </div>
                </div>
                <p id="wishlistAdditions" style="margin: 0; font-size: 32px; font-weight: bold; color: #333;">-</p>
            </div>

            <!-- Low Stock & Products on Sale Card -->
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="background: #fff3e0; padding: 12px; border-radius: 8px; margin-right: 12px;">
                        <span style="font-size: 24px;">📊</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 14px; color: #666;">Inventory</h3>
                    </div>
                </div>
                <p style="margin: 0; font-size: 16px; color: #666;">
                    Low stock: <span id="lowStock" style="font-weight: bold; color: #f44336;">0</span>
                    <span style="margin: 0 8px;">|</span>
                    On sale: <span id="productsOnSale" style="font-weight: bold; color: #4caf50;">0</span>
                </p>
            </div>

            <!-- Products Added to Cart Card -->
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <div style="display: flex; align-items: center; margin-bottom: 12px;">
                    <div style="background: #f3e5f5; padding: 12px; border-radius: 8px; margin-right: 12px;">
                        <span style="font-size: 24px;">🛒</span>
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 14px; color: #666;">Products Added to Cart</h3>
                    </div>
                </div>
                <p style="margin: 0; font-size: 16px; color: #666;">
                    Count: <span id="cartCount" style="font-weight: bold;">0</span>
                    <span style="margin: 0 8px;">|</span>
                    Value: <span id="cartValue" style="font-weight: bold; color: #4caf50;">$0</span>
                </p>
            </div>
        </div>

        <!-- Statistics Section -->
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Activity Statistics</h3>
            <canvas id="activityChart" style="max-height: 300px;"></canvas>
        </div>

        <!-- Two Column Tables -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
            <!-- Top Products by Wishlist Additions -->
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Top Products by Wishlist Additions</h3>
                <div id="topProducts" style="overflow-x: auto;">
                    <p style="text-align: center; color: #666; padding: 20px;">Loading...</p>
                </div>
            </div>

            <!-- Top Customers by Wishlist Additions -->
            <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Top Customers by Wishlist Additions</h3>
                <div id="topCustomers" style="overflow-x: auto;">
                    <p style="text-align: center; color: #666; padding: 20px;">Loading...</p>
                </div>
            </div>
        </div>

        <!-- Recent Activities -->
        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 20px;">
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Recent Activity</h3>
            <div id="recentActivities" style="max-height: 400px; overflow-y: auto;">
                <p style="text-align: center; color: #666; padding: 20px;">Loading...</p>
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

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        let activityChart = null;

        // Initialize dates to current month
        function initializeDates() {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            
            document.getElementById('startDate').valueAsDate = firstDay;
            document.getElementById('endDate').valueAsDate = lastDay;
        }

        function setDateRange(range) {
            const now = new Date();
            let startDate, endDate;

            switch(range) {
                case 'today':
                    startDate = new Date(now);
                    endDate = new Date(now);
                    break;
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - now.getDay());
                    endDate = new Date(now);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    break;
            }

            document.getElementById('startDate').valueAsDate = startDate;
            document.getElementById('endDate').valueAsDate = endDate;
            refreshDashboard();
        }

        async function refreshDashboard() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            await Promise.all([
                loadInsights(startDate, endDate),
                loadTopProducts(startDate, endDate),
                loadTopCustomers(startDate, endDate),
                loadActivityStats(startDate, endDate),
                loadRecentActivities()
            ]);
        }

        async function loadInsights(startDate, endDate) {
            try {
                const response = await fetch(`/api/dashboard/insights?start_date=${startDate}&end_date=${endDate}`);
                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('wishlistAdditions').textContent = result.data.wishlistAdditions;
                    document.getElementById('lowStock').textContent = result.data.lowStock;
                    document.getElementById('productsOnSale').textContent = result.data.productsOnSale;
                    document.getElementById('cartCount').textContent = result.data.productsAddedToCart.count;
                    document.getElementById('cartValue').textContent = '$' + result.data.productsAddedToCart.value;
                }
            } catch (error) {
                console.error('Error loading insights:', error);
            }
        }

        async function loadTopProducts(startDate, endDate) {
            try {
                const response = await fetch(`/api/dashboard/top-products?start_date=${startDate}&end_date=${endDate}&limit=10`);
                const result = await response.json();
                
                if (result.success && result.data.length > 0) {
                    let html = '<table style="width: 100%; border-collapse: collapse;">';
                    html += '<thead><tr style="background-color: #f9f9f9;">';
                    html += '<th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e5e5;">Product</th>';
                    html += '<th style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e5e5;">Additions</th>';
                    html += '</tr></thead><tbody>';
                    
                    result.data.forEach(product => {
                        html += `<tr style="border-bottom: 1px solid #f0f0f0;">`;
                        html += `<td style="padding: 8px;">${product.product_name || 'Unknown Product'}</td>`;
                        html += `<td style="padding: 8px; text-align: center;"><span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${product.additions_count}</span></td>`;
                        html += `</tr>`;
                    });
                    
                    html += '</tbody></table>';
                    document.getElementById('topProducts').innerHTML = html;
                } else {
                    document.getElementById('topProducts').innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No data available</p>';
                }
            } catch (error) {
                console.error('Error loading top products:', error);
                document.getElementById('topProducts').innerHTML = '<p style="text-align: center; color: #f44336; padding: 20px;">Error loading data</p>';
            }
        }

        async function loadTopCustomers(startDate, endDate) {
            try {
                const response = await fetch(`/api/dashboard/top-customers?start_date=${startDate}&end_date=${endDate}&limit=10`);
                const result = await response.json();
                
                if (result.success && result.data.length > 0) {
                    let html = '<table style="width: 100%; border-collapse: collapse;">';
                    html += '<thead><tr style="background-color: #f9f9f9;">';
                    html += '<th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e5e5;">Customer</th>';
                    html += '<th style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e5e5;">Additions</th>';
                    html += '</tr></thead><tbody>';
                    
                    result.data.forEach(customer => {
                        html += `<tr style="border-bottom: 1px solid #f0f0f0;">`;
                        html += `<td style="padding: 8px;">`;
                        html += `<div style="font-weight: 500;">${customer.name || 'Unknown'}</div>`;
                        html += `<div style="font-size: 12px; color: #666;">${customer.email}</div>`;
                        html += `</td>`;
                        html += `<td style="padding: 8px; text-align: center;"><span style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${customer.additions_count}</span></td>`;
                        html += `</tr>`;
                    });
                    
                    html += '</tbody></table>';
                    document.getElementById('topCustomers').innerHTML = html;
                } else {
                    document.getElementById('topCustomers').innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No data available</p>';
                }
            } catch (error) {
                console.error('Error loading top customers:', error);
                document.getElementById('topCustomers').innerHTML = '<p style="text-align: center; color: #f44336; padding: 20px;">Error loading data</p>';
            }
        }

        async function loadActivityStats(startDate, endDate) {
            try {
                const response = await fetch(`/api/dashboard/activity-stats?start_date=${startDate}&end_date=${endDate}&group_by=day`);
                const result = await response.json();
                
                if (result.success) {
                    const ctx = document.getElementById('activityChart').getContext('2d');
                    
                    // Destroy existing chart if it exists
                    if (activityChart) {
                        activityChart.destroy();
                    }
                    
                    const labels = result.data.map(item => item.date);
                    const addData = result.data.map(item => item.add + item.create_new);
                    const removeData = result.data.map(item => item.remove);
                    
                    activityChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Additions',
                                data: addData,
                                borderColor: '#4caf50',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                tension: 0.4
                            }, {
                                label: 'Removals',
                                data: removeData,
                                borderColor: '#f44336',
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                tension: 0.4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1
                                    }
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error loading activity stats:', error);
            }
        }

        async function loadRecentActivities() {
            try {
                const response = await fetch('/api/dashboard/recent-activities?limit=20');
                const result = await response.json();
                
                if (result.success && result.data.length > 0) {
                    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
                    
                    result.data.forEach(activity => {
                        const activityIcon = activity.activity_type === 'add' || activity.activity_type === 'create_new' ? '➕' : '➖';
                        const activityColor = activity.activity_type === 'add' || activity.activity_type === 'create_new' ? '#4caf50' : '#f44336';
                        const activityText = activity.activity_type === 'create_new' ? 'created wishlist with' : 
                                           activity.activity_type === 'add' ? 'added to wishlist' : 'removed from wishlist';
                        
                        html += `<div style="display: flex; align-items: start; padding: 12px; background: #f9f9f9; border-radius: 4px; border-left: 3px solid ${activityColor};">`;
                        html += `<span style="margin-right: 12px; font-size: 20px;">${activityIcon}</span>`;
                        html += `<div style="flex: 1;">`;
                        html += `<p style="margin: 0; font-size: 14px;"><strong>${activity.customer_name}</strong> ${activityText} <strong>${activity.product_name}</strong></p>`;
                        html += `<p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${activity.human_time}</p>`;
                        html += `</div>`;
                        html += `</div>`;
                    });
                    
                    html += '</div>';
                    document.getElementById('recentActivities').innerHTML = html;
                } else {
                    document.getElementById('recentActivities').innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No recent activities</p>';
                }
            } catch (error) {
                console.error('Error loading recent activities:', error);
                document.getElementById('recentActivities').innerHTML = '<p style="text-align: center; color: #f44336; padding: 20px;">Error loading data</p>';
            }
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            initializeDates();
            refreshDashboard();
        });
    </script>
@endsection