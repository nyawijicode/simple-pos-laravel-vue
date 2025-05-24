<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Sales History</h1>
      <router-link 
        v-if="authStore.hasPermission('sale-create')" 
        to="/pos" 
        class="btn btn-primary"
      >
        <i class="bi bi-cart-plus me-1"></i> New Sale
      </router-link>
    </div>

    <!-- Filters and Search -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="Search invoice, customer..."
                v-model="searchQuery"
                @input="debouncedSearch"
              />
              <button class="btn btn-outline-secondary" type="button" @click="searchSales">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-8">
            <div class="d-flex flex-wrap gap-2">
              <div class="input-group">
                <span class="input-group-text">From</span>
                <input
                  type="date"
                  class="form-control"
                  v-model="dateRange.start"
                  @change="filterSales"
                />
              </div>
              <div class="input-group">
                <span class="input-group-text">To</span>
                <input
                  type="date"
                  class="form-control"
                  v-model="dateRange.end"
                  @change="filterSales"
                />
              </div>
              <select class="form-select" v-model="statusFilter" @change="filterSales">
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button class="btn btn-outline-secondary" @click="resetFilters">
                <i class="bi bi-x-circle me-1"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <h6 class="card-title">Total Sales</h6>
            <h3 class="card-text">{{ filteredSales.length }}</h3>
            <p class="card-text">{{ formatCurrency(calculateTotalAmount()) }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <h6 class="card-title">Completed Sales</h6>
            <h3 class="card-text">{{ getStatusCount('completed') }}</h3>
            <p class="card-text">{{ formatCurrency(getStatusAmount('completed')) }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-warning text-dark h-100">
          <div class="card-body">
            <h6 class="card-title">Pending Sales</h6>
            <h3 class="card-text">{{ getStatusCount('pending') }}</h3>
            <p class="card-text">{{ formatCurrency(getStatusAmount('pending')) }}</p>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-danger text-white h-100">
          <div class="card-body">
            <h6 class="card-title">Cancelled Sales</h6>
            <h3 class="card-text">{{ getStatusCount('cancelled') }}</h3>
            <p class="card-text">{{ formatCurrency(getStatusAmount('cancelled')) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error message -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- No sales found -->
    <div v-else-if="paginatedSales.length === 0" class="text-center py-5">
      <i class="bi bi-receipt display-1 text-muted"></i>
      <p class="lead mt-3">No sales found</p>
      <p v-if="searchQuery || dateRange.start || dateRange.end || statusFilter" class="text-muted">
        Try changing your search criteria or reset filters
      </p>
      <p v-else class="text-muted">
        Start by creating a new sale in the POS
      </p>
    </div>

    <!-- Sales table -->
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">
                <a href="#" @click.prevent="setSorting('invoice_number')">
                  Invoice #
                  <i v-if="sortConfig.key === 'invoice_number'" class="bi"
                    :class="sortConfig.direction === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'"></i>
                </a>
              </th>
              <th scope="col">
                <a href="#" @click.prevent="setSorting('created_at')">
                  Date
                  <i v-if="sortConfig.key === 'created_at'" class="bi"
                    :class="sortConfig.direction === 'asc' ? 'bi-sort-down' : 'bi-sort-up'"></i>
                </a>
              </th>
              <th scope="col">Customer</th>
              <th scope="col">Cashier</th>
              <th scope="col">Items</th>
              <th scope="col">
                <a href="#" @click.prevent="setSorting('total_amount')">
                  Total
                  <i v-if="sortConfig.key === 'total_amount'" class="bi"
                    :class="sortConfig.direction === 'asc' ? 'bi-sort-numeric-down' : 'bi-sort-numeric-up'"></i>
                </a>
              </th>
              <th scope="col">Payment</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in paginatedSales" :key="sale.id">
              <td>
                <router-link :to="`/sales/${sale.id}`" class="fw-bold link-primary">
                  {{ sale.invoice_number }}
                </router-link>
              </td>
              <td>{{ formatDateTime(sale.created_at) }}</td>
              <td>{{ sale.customer?.name || 'Walk-in Customer' }}</td>
              <td>{{ sale.user?.name || 'Unknown' }}</td>
              <td>
                <span class="badge bg-info">{{ getSaleItemsCount(sale) }}</span>
              </td>
              <td>{{ formatCurrency(sale.total_amount) }}</td>
              <td class="text-capitalize">{{ sale.payment_method }}</td>
              <td>
                <span class="badge"
                  :class="{
                    'bg-success': sale.status === 'completed',
                    'bg-warning text-dark': sale.status === 'pending',
                    'bg-danger': sale.status === 'cancelled'
                  }"
                >
                  {{ sale.status.toUpperCase() }}
                </span>
              </td>
              <td class="text-end">
                <div class="btn-group">
                  <router-link :to="`/sales/${sale.id}`" class="btn btn-sm btn-outline-secondary">
                    <i class="bi bi-eye"></i>
                  </router-link>
                  <button 
                    v-if="sale.status === 'completed' && authStore.hasPermission('sale-edit')" 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmCancelSale(sale)"
                  >
                    <i class="bi bi-x-circle"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-4">
      <div>
        <span class="text-muted">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredSales.length) }} of {{ filteredSales.length }} entries</span>
      </div>
      <nav>
        <ul class="pagination mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
          </li>
          <li 
            v-for="page in paginationItems" 
            :key="page"
            class="page-item" 
            :class="{ active: currentPage === page, disabled: page === '...' }"
          >
            <a class="page-link" href="#" @click.prevent="page !== '...' && changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Store
const authStore = useAuthStore();

// Data
const allSales = ref([]);
const filteredSales = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const statusFilter = ref('');
const dateRange = ref({
  start: '',
  end: ''
});
const sortConfig = ref({
  key: 'created_at',
  direction: 'desc'
});

// Pagination
const itemsPerPage = 10;
const currentPage = ref(1);

// Lifecycle hooks
onMounted(async () => {
  // Check permission
  if (!authStore.hasPermission('sale-list')) {
    error.value = 'You do not have permission to view sales';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    
    // Fetch sales
    const response = await api.get('/sales');
    allSales.value = response.data.data;
    
    // Apply initial sorting and filtering
    sortAndFilterSales();
    
    error.value = null;
  } catch (err) {
    console.error('Error fetching sales:', err);
    error.value = 'Failed to load sales. Please try again later.';
  } finally {
    loading.value = false;
  }
});

// Format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format currency
const formatCurrency = (value) => {
  if (value === undefined || value === null) return '';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value);
};

// Get number of items in a sale
const getSaleItemsCount = (sale) => {
  if (!sale.sale_items) return 0;
  return sale.sale_items.length;
};

// Calculate total amount
const calculateTotalAmount = () => {
  return filteredSales.value.reduce((total, sale) => {
    return total + parseFloat(sale.total_amount);
  }, 0);
};

// Get count of sales by status
const getStatusCount = (status) => {
  return filteredSales.value.filter(sale => sale.status === status).length;
};

// Get amount of sales by status
const getStatusAmount = (status) => {
  return filteredSales.value
    .filter(sale => sale.status === status)
    .reduce((total, sale) => total + parseFloat(sale.total_amount), 0);
};

// Sort and filter sales
const sortAndFilterSales = () => {
  let result = [...allSales.value];
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(sale => 
      (sale.invoice_number && sale.invoice_number.toLowerCase().includes(query)) ||
      (sale.customer && sale.customer.name && sale.customer.name.toLowerCase().includes(query)) ||
      (sale.user && sale.user.name && sale.user.name.toLowerCase().includes(query))
    );
  }
  
  // Apply status filter
  if (statusFilter.value) {
    result = result.filter(sale => sale.status === statusFilter.value);
  }
  
  // Apply date range filter
  if (dateRange.value.start) {
    const startDate = new Date(dateRange.value.start);
    startDate.setHours(0, 0, 0, 0);
    result = result.filter(sale => new Date(sale.created_at) >= startDate);
  }
  
  if (dateRange.value.end) {
    const endDate = new Date(dateRange.value.end);
    endDate.setHours(23, 59, 59, 999);
    result = result.filter(sale => new Date(sale.created_at) <= endDate);
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let valueA, valueB;
    
    if (sortConfig.value.key === 'created_at') {
      valueA = new Date(a.created_at).getTime();
      valueB = new Date(b.created_at).getTime();
    } else if (sortConfig.value.key === 'total_amount') {
      valueA = parseFloat(a.total_amount);
      valueB = parseFloat(b.total_amount);
    } else {
      valueA = a[sortConfig.value.key];
      valueB = b[sortConfig.value.key];
      
      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.value.direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
    }
    
    return sortConfig.value.direction === 'asc' ? valueA - valueB : valueB - valueA;
  });
  
  filteredSales.value = result;
  
  // Reset to first page when filters change
  currentPage.value = 1;
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    sortAndFilterSales();
  }, 300);
};

// Search sales
const searchSales = () => {
  sortAndFilterSales();
};

// Filter sales
const filterSales = () => {
  sortAndFilterSales();
};

// Reset filters
const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  dateRange.value = {
    start: '',
    end: ''
  };
  sortConfig.value = {
    key: 'created_at',
    direction: 'desc'
  };
  sortAndFilterSales();
};

// Set sorting
const setSorting = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = 'asc';
  }
  sortAndFilterSales();
};

// Confirm cancel sale
const confirmCancelSale = (sale) => {
  if (sale.status !== 'completed') {
    Swal.fire({
      icon: 'warning',
      title: 'Cannot Cancel',
      text: 'Only completed sales can be cancelled',
    });
    return;
  }
  
  Swal.fire({
    title: 'Are you sure?',
    text: `Cancel sale #${sale.invoice_number}? This will return all items to inventory.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, cancel it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.put(`/sales/${sale.id}`, {
          status: 'cancelled',
          notes: sale.notes ? `${sale.notes} (Cancelled)` : 'Cancelled by user'
        });
        
        // Refresh sale data
        const response = await api.get('/sales');
        allSales.value = response.data.data;
        sortAndFilterSales();
        
        Swal.fire(
          'Cancelled!',
          'The sale has been cancelled and items returned to inventory.',
          'success'
        );
      } catch (err) {
        console.error('Error cancelling sale:', err);
        Swal.fire(
          'Error!',
          err.response?.data?.message || 'Failed to cancel sale.',
          'error'
        );
      }
    }
  });
};

// Pagination
const totalPages = computed(() => Math.ceil(filteredSales.value.length / itemsPerPage));

const paginationItems = computed(() => {
  if (totalPages.value <= 7) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  }
  
  if (currentPage.value <= 3) {
    return [1, 2, 3, 4, '...', totalPages.value];
  }
  
  if (currentPage.value >= totalPages.value - 2) {
    return [1, '...', totalPages.value - 3, totalPages.value - 2, totalPages.value - 1, totalPages.value];
  }
  
  return [
    1, 
    '...', 
    currentPage.value - 1, 
    currentPage.value, 
    currentPage.value + 1, 
    '...', 
    totalPages.value
  ];
});

const paginatedSales = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredSales.value.slice(startIndex, endIndex);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Watch for changes to apply filtering
watch([searchQuery, statusFilter, dateRange, sortConfig], () => {
  sortAndFilterSales();
}, { deep: true });
</script>

<style scoped>
/* Make the table headers clickable for sorting */
th a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

th a:hover {
  text-decoration: underline;
}

/* Responsive fixes */
@media (max-width: 991px) {
  .d-flex.flex-wrap {
    justify-content: space-between;
  }
  
  .input-group {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>