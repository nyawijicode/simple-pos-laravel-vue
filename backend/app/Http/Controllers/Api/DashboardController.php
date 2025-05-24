<?php
// app/Http/Controllers/Api/DashboardController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sale;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics.
     */
    public function index()
    {
        // Get today's date
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $thisYear = Carbon::now()->startOfYear();

        // Sales statistics
        $totalSales = Sale::count();
        $totalSalesAmount = Sale::sum('total_amount');
        $todaySales = Sale::whereDate('created_at', $today)->count();
        $todaySalesAmount = Sale::whereDate('created_at', $today)->sum('total_amount');
        $thisMonthSales = Sale::whereDate('created_at', '>=', $thisMonth)->count();
        $thisMonthSalesAmount = Sale::whereDate('created_at', '>=', $thisMonth)->sum('total_amount');
        $thisYearSales = Sale::whereDate('created_at', '>=', $thisYear)->count();
        $thisYearSalesAmount = Sale::whereDate('created_at', '>=', $thisYear)->sum('total_amount');

        // Products statistics
        $totalProducts = Product::count();
        $lowStockProducts = Product::whereRaw('stock <= alert_stock')->count();
        $outOfStockProducts = Product::where('stock', 0)->count();
        $activeProducts = Product::where('is_active', true)->count();

        // Customers statistics
        $totalCustomers = Customer::count();
        $activeCustomers = Customer::where('is_active', true)->count();
        $newCustomersToday = Customer::whereDate('created_at', $today)->count();
        $newCustomersThisMonth = Customer::whereDate('created_at', '>=', $thisMonth)->count();

        // Users statistics
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();

        // Recent sales
        $recentSales = Sale::with(['customer', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Sales by month
        $salesByMonth = Sale::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('YEAR(created_at) as year'),
            DB::raw('SUM(total_amount) as total_amount'),
            DB::raw('COUNT(*) as count')
        )
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        // Top selling products
        $topSellingProducts = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.code',
                DB::raw('SUM(sale_items.quantity) as total_quantity'),
                DB::raw('SUM(sale_items.subtotal) as total_amount')
            )
            ->groupBy('products.id', 'products.name', 'products.code')
            ->orderBy('total_quantity', 'desc')
            ->limit(10)
            ->get();

        // Top customers
        $topCustomers = DB::table('sales')
            ->join('customers', 'sales.customer_id', '=', 'customers.id')
            ->select(
                'customers.id',
                'customers.name',
                'customers.email',
                DB::raw('COUNT(sales.id) as total_sales'),
                DB::raw('SUM(sales.total_amount) as total_amount')
            )
            ->whereNotNull('sales.customer_id')
            ->groupBy('customers.id', 'customers.name', 'customers.email')
            ->orderBy('total_amount', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'sales' => [
                'total' => $totalSales,
                'total_amount' => $totalSalesAmount,
                'today' => $todaySales,
                'today_amount' => $todaySalesAmount,
                'this_month' => $thisMonthSales,
                'this_month_amount' => $thisMonthSalesAmount,
                'this_year' => $thisYearSales,
                'this_year_amount' => $thisYearSalesAmount,
            ],
            'products' => [
                'total' => $totalProducts,
                'low_stock' => $lowStockProducts,
                'out_of_stock' => $outOfStockProducts,
                'active' => $activeProducts,
            ],
            'customers' => [
                'total' => $totalCustomers,
                'active' => $activeCustomers,
                'new_today' => $newCustomersToday,
                'new_this_month' => $newCustomersThisMonth,
            ],
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
            ],
            'recent_sales' => $recentSales,
            'sales_by_month' => $salesByMonth,
            'top_selling_products' => $topSellingProducts,
            'top_customers' => $topCustomers,
        ]);
    }
}