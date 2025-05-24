<template>
  <div>
    <h1 class="mb-4">Dashboard</h1>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else>
      <!-- Statistics Cards -->
      <div class="row">
        <div class="col-md-3 mb-4">
          <div class="card bg-primary text-white h-100">
            <div class="card-body">
              <h5 class="card-title">Total Sales</h5>
              <h2 class="card-text">{{ dashboard.sales?.total || 0 }}</h2>
              <p class="card-text">{{ formatCurrency(dashboard.sales?.total_amount || 0) }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-4">
          <div class="card bg-success text-white h-100">
            <div class="card-body">
              <h5 class="card-title">Today's Sales</h5>
              <h2 class="card-text">{{ dashboard.sales?.today || 0 }}</h2>
              <p class="card-text">{{ formatCurrency(dashboard.sales?.today_amount || 0) }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-4">
          <div class="card bg-info text-white h-100">
            <div class="card-body">
              <h5 class="card-title">Total Products</h5>
              <h2 class="card-text">{{ dashboard.products?.total || 0 }}</h2>
              <p class="card-text">{{ dashboard.products?.active || 0 }} active</p>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-4">
          <div class="card bg-warning text-dark h-100">
            <div class="card-body">
              <h5 class="card-title">Total Customers</h5>
              <h2 class="card-text">{{ dashboard.customers?.total || 0 }}</h2>
              <p class="card-text">{{ dashboard.customers?.active || 0 }} active</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Sales by Month</h5>
            </div>
            <div class="card-body">
              <SalesChart :chartData="salesChartData" />
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Products Status</h5>
            </div>
            <div class="card-body">
              <ProductStatusChart :chartData="productChartData" />
            </div>
          </div>
        </div>
      </div>

      <!-- Top Products and Recent Sales Row -->
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Top Selling Products</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Code</th>
                      <th>Sold</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="product in dashboard.top_selling_products" :key="product.id">
                      <td>{{ product.name }}</td>
                      <td>{{ product.code }}</td>
                      <td>{{ product.total_quantity }}</td>
                      <td>{{ formatCurrency(product.total_amount) }}</td>
                    </tr>
                    <tr v-if="!dashboard.top_selling_products?.length">
                      <td colspan="4" class="text-center">No data available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Recent Sales</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sale in dashboard.recent_sales" :key="sale.id">
                      <td>{{ sale.invoice_number }}</td>
                      <td>{{ sale.customer?.name || 'Walk-in Customer' }}</td>
                      <td>{{ formatCurrency(sale.total_amount) }}</td>
                      <td>{{ formatDate(sale.created_at) }}</td>
                    </tr>
                    <tr v-if="!dashboard.recent_sales?.length">
                      <td colspan="4" class="text-center">No data available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../../services/api';
import SalesChart from './SalesChart.vue';
import ProductStatusChart from './ProductStatusChart.vue';

const dashboard = ref({});
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await api.get('/dashboard');
    dashboard.value = response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    loading.value = false;
  }
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const salesChartData = computed(() => {
  if (!dashboard.value.sales_by_month) return null;

  const labels = dashboard.value.sales_by_month.map(item => {
    const month = new Date(0, item.month - 1).toLocaleString('default', { month: 'short' });
    return `${month} ${item.year}`;
  });

  const data = dashboard.value.sales_by_month.map(item => item.total_amount);

  return {
    labels,
    datasets: [
      {
        label: 'Sales Amount',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        data,
      },
    ],
  };
});

const productChartData = computed(() => {
  if (!dashboard.value.products) return null;

  return {
    labels: ['Active', 'Inactive', 'Low Stock', 'Out of Stock'],
    datasets: [
      {
        backgroundColor: ['#28a745', '#6c757d', '#ffc107', '#dc3545'],
        data: [
          dashboard.value.products.active || 0,
          (dashboard.value.products.total - dashboard.value.products.active) || 0,
          dashboard.value.products.low_stock || 0,
          dashboard.value.products.out_of_stock || 0,
        ],
      },
    ],
  };
});
</script>