<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Wishlist;
use App\Models\WishlistActivity;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard
     */
    public function index()
    {
        $shop = User::first();
        $shopDomain = $shop ? $shop->name : 'your-shop';

        return view('welcome', compact('shopDomain'));
    }

    /**
     * Get dashboard insights for a specific date range
     */
    public function getInsights(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

        // Parse dates if they're strings
        if (is_string($startDate)) {
            $startDate = Carbon::parse($startDate);
        }
        if (is_string($endDate)) {
            $endDate = Carbon::parse($endDate);
        }

        // Wishlist additions count
        $wishlistAdditions = WishlistActivity::whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('activity_type', ['add', 'create_new'])
            ->count();

        // Total products added to cart (placeholder - would need cart tracking)
        $productsAddedToCart = 0;
        $cartValue = 0;

        // Low stock products (placeholder - would need inventory tracking)
        $lowStock = 0;

        // Products on sale (placeholder - would need pricing/discount tracking)
        $productsOnSale = 0;

        return response()->json([
            'success' => true,
            'data' => [
                'wishlistAdditions' => $wishlistAdditions,
                'productsAddedToCart' => [
                    'count' => $productsAddedToCart,
                    'value' => $cartValue,
                ],
                'lowStock' => $lowStock,
                'productsOnSale' => $productsOnSale,
                'dateRange' => [
                    'start' => $startDate->toDateString(),
                    'end' => $endDate->toDateString(),
                ],
            ],
        ]);
    }

    /**
     * Get top products by wishlist additions
     */
    public function getTopProducts(Request $request)
    {
        $limit = $request->input('limit', 10);
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

        // Parse dates if they're strings
        if (is_string($startDate)) {
            $startDate = Carbon::parse($startDate);
        }
        if (is_string($endDate)) {
            $endDate = Carbon::parse($endDate);
        }

        $topProducts = WishlistActivity::select('product_shopify_id', 'product_name', DB::raw('count(*) as additions_count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereIn('activity_type', ['add', 'create_new'])
            ->groupBy('product_shopify_id', 'product_name')
            ->orderByDesc('additions_count')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $topProducts,
        ]);
    }

    /**
     * Get top customers by wishlist additions
     */
    public function getTopCustomers(Request $request)
    {
        $limit = $request->input('limit', 10);
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth());

        // Parse dates if they're strings
        if (is_string($startDate)) {
            $startDate = Carbon::parse($startDate);
        }
        if (is_string($endDate)) {
            $endDate = Carbon::parse($endDate);
        }

        $topCustomers = WishlistActivity::select('wishlist_activities.customer_id', 'customers.name', 'customers.email', DB::raw('count(*) as additions_count'))
            ->join('customers', 'wishlist_activities.customer_id', '=', 'customers.id')
            ->whereBetween('wishlist_activities.created_at', [$startDate, $endDate])
            ->whereIn('wishlist_activities.activity_type', ['add', 'create_new'])
            ->groupBy('wishlist_activities.customer_id', 'customers.name', 'customers.email')
            ->orderByDesc('additions_count')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $topCustomers,
        ]);
    }

    /**
     * Get activity statistics for chart
     */
    public function getActivityStats(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth());
        $groupBy = $request->input('group_by', 'day'); // day, week, month

        // Parse dates if they're strings
        if (is_string($startDate)) {
            $startDate = Carbon::parse($startDate);
        }
        if (is_string($endDate)) {
            $endDate = Carbon::parse($endDate);
        }

        // Build the date format based on grouping
        $dateFormat = match ($groupBy) {
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $stats = WishlistActivity::select(
            DB::raw("DATE_FORMAT(created_at, '{$dateFormat}') as date"),
            'activity_type',
            DB::raw('count(*) as count')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date', 'activity_type')
            ->orderBy('date')
            ->get();

        // Group by date for easier frontend processing
        $groupedStats = [];
        foreach ($stats as $stat) {
            if (! isset($groupedStats[$stat->date])) {
                $groupedStats[$stat->date] = [
                    'date' => $stat->date,
                    'add' => 0,
                    'remove' => 0,
                    'create_new' => 0,
                ];
            }
            $groupedStats[$stat->date][$stat->activity_type] = $stat->count;
        }

        return response()->json([
            'success' => true,
            'data' => array_values($groupedStats),
        ]);
    }

    /**
     * Get recent activities
     */
    public function getRecentActivities(Request $request)
    {
        $limit = $request->input('limit', 20);

        $activities = WishlistActivity::with('customer')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'customer_name' => $activity->customer->name,
                    'customer_email' => $activity->customer->email,
                    'product_name' => $activity->product_name,
                    'activity_type' => $activity->activity_type,
                    'created_at' => $activity->created_at->format('Y-m-d H:i:s'),
                    'human_time' => $activity->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }
}
