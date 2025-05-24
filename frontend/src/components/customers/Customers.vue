<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Customers</h1>
      <router-link 
        v-if="authStore.hasPermission('customer-create')" 
        to="/customers/create" 
        class="btn btn-primary"
      >
        <i class="bi bi-person-plus me-1"></i> Add Customer
      </router-link>
    </div>

    <!-- Search and filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="Search customers..."
                v-model="searchQuery"
                @input="debouncedSearch"
              />
              <button class="btn btn-outline-secondary" type="button" @click="searchCustomers">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6 d-flex justify-content-md-end mt-3 mt-md-0">
            <select class="form-select w-auto" v-model="statusFilter" @change="filterCustomers">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer stats -->
    <div class="row mb-4">
      <div class="col-md-4 mb-3">
        <div class="card bg-primary text-white h-100">
          <div class="card-body">
            <h6 class="card-title">Total Customers</h6>
            <h3 class="card-text">{{ totalCustomers }}</h3>
            <p class="card-text">{{ activeCustomers }} active</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="card bg-success text-white h-100">
          <div class="card-body">
            <h6 class="card-title">Customers with Purchases</h6>
            <h3 class="card-text">{{ customersWithPurchases }}</h3>
            <p class="card-text">{{ Math.round((customersWithPurchases / totalCustomers) * 100) || 0 }}% of total</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-3">
        <div class="card bg-info text-white h-100">
          <div class="card-body">
            <h6 class="card-title">New Customers</h6>
            <h3 class="card-text">{{ newCustomers }}</h3>
            <p class="card-text">Last 30 days</p>
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

    <!-- No customers found -->
    <div v-else-if="filteredCustomers.length === 0" class="text-center py-5">
      <i class="bi bi-people display-1 text-muted"></i>
      <p class="lead mt-3">No customers found</p>
      <p v-if="searchQuery || statusFilter" class="text-muted">
        Try changing your search criteria
      </p>
      <p v-else-if="authStore.hasPermission('customer-create')" class="text-muted">
        Start by adding a new customer
      </p>
    </div>

    <!-- Customers table -->
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">
                <a href="#" @click.prevent="setSorting('name')">
                  Name
                  <i v-if="sortConfig.key === 'name'" class="bi"
                    :class="sortConfig.direction === 'asc' ? 'bi-sort-alpha-down' : 'bi-sort-alpha-up'"></i>
                </a>
              </th>
              <th scope="col">Contact</th>
              <th scope="col">Address</th>
              <th scope="col">
                <a href="#" @click.prevent="setSorting('created_at')">
                  Customer Since
                  <i v-if="sortConfig.key === 'created_at'" class="bi"
                    :class="sortConfig.direction === 'asc' ? 'bi-sort-down' : 'bi-sort-up'"></i>
                </a>
              </th>
              <th scope="col">Purchases</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in paginatedCustomers" :key="customer.id">
              <td>
                <router-link :to="`/customers/${customer.id}/edit`" class="fw-bold link-primary">
                  {{ customer.name }}
                </router-link>
              </td>
              <td>
                <div v-if="customer.email">
                  <i class="bi bi-envelope me-1"></i>
                  <a :href="`mailto:${customer.email}`">{{ customer.email }}</a>
                </div>
                <div v-if="customer.phone">
                  <i class="bi bi-telephone me-1"></i>
                  <a :href="`tel:${customer.phone}`">{{ customer.phone }}</a>
                </div>
                <span v-if="!customer.email && !customer.phone" class="text-muted">No contact info</span>
              </td>
              <td>
                <span v-if="customer.address" class="text-truncate d-inline-block" style="max-width: 200px;">
                  {{ customer.address }}
                </span>
                <span v-else class="text-muted">No address</span>
              </td>
              <td>{{ formatDate(customer.created_at) }}</td>
              <td>
                <span class="badge bg-info">
                  {{ customer.sales_count || 0 }}
                </span>
                <span v-if="customer.sales_count" class="ms-1">
                  {{ formatCurrency(customer.total_spent || 0) }}
                </span>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="customer.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ customer.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-end">
                <div class="btn-group">
                  <router-link 
                    v-if="authStore.hasPermission('customer-edit')" 
                    :to="`/customers/${customer.id}/edit`" 
                    class="btn btn-sm btn-outline-primary"
                  >
                    <i class="bi bi-pencil"></i>
                  </router-link>
                  <button 
                    v-if="authStore.hasPermission('sale-create')" 
                    class="btn btn-sm btn-outline-success"
                    @click="createSaleForCustomer(customer)"
                  >
                    <i class="bi bi-cart-plus"></i>
                  </button>
                  <button 
                    v-if="authStore.hasPermission('customer-delete')" 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(customer)"
                    :disabled="customer.sales_count > 0"
                    :title="customer.sales_count > 0 ? 'Cannot delete: Customer has purchases' : 'Delete'"
                  >
                    <i class="bi bi-trash"></i>
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
        <span class="text-muted">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredCustomers.length) }} of {{ filteredCustomers.length }} customers</span>
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Router and store
const router = useRouter();
const authStore = useAuthStore();

// Data
const allCustomers = ref([]);
const filteredCustomers = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const statusFilter = ref('');
const sortConfig = ref({
  key: 'name',
  direction: 'asc'
});

// Pagination
const itemsPerPage = 10;
const currentPage = ref(1);

// Customer stats
const totalCustomers = computed(() => allCustomers.value.length);
const activeCustomers = computed(() => allCustomers.value.filter(c => c.is_active).length);
const customersWithPurchases = computed(() => allCustomers.value.filter(c => c.sales_count > 0).length);
const newCustomers = computed(() => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return allCustomers.value.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length;
});

// Lifecycle hooks
onMounted(async () => {
  // Check permission
  if (!authStore.hasPermission('customer-list')) {
    error.value = 'You do not have permission to view customers';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    
    // Fetch customers
    const response = await api.get('/customers');
    allCustomers.value = response.data.data;
    
    // Apply initial sorting and filtering
    sortAndFilterCustomers();
    
    error.value = null;
  } catch (err) {
    console.error('Error fetching customers:', err);
    error.value = 'Failed to load customers. Please try again later.';
  } finally {
    loading.value = false;
  }
});

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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

// Sort and filter customers
const sortAndFilterCustomers = () => {
  let result = [...allCustomers.value];
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(customer => 
      (customer.name && customer.name.toLowerCase().includes(query)) ||
      (customer.email && customer.email.toLowerCase().includes(query)) ||
      (customer.phone && customer.phone.toLowerCase().includes(query)) ||
      (customer.address && customer.address.toLowerCase().includes(query))
    );
  }
  
  // Apply status filter
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active';
    result = result.filter(customer => customer.is_active === isActive);
  }
  
  // Apply sorting
  result.sort((a, b) => {
    let valueA, valueB;
    
    if (sortConfig.value.key === 'created_at') {
      valueA = new Date(a.created_at).getTime();
      valueB = new Date(b.created_at).getTime();
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
  
  filteredCustomers.value = result;
  
  // Reset to first page when filters change
  currentPage.value = 1;
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    sortAndFilterCustomers();
  }, 300);
};

// Search customers
const searchCustomers = () => {
  sortAndFilterCustomers();
};

// Filter customers
const filterCustomers = () => {
  sortAndFilterCustomers();
};

// Set sorting
const setSorting = (key) => {
  if (sortConfig.value.key === key) {
    sortConfig.value.direction = sortConfig.value.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.value.key = key;
    sortConfig.value.direction = 'asc';
  }
  sortAndFilterCustomers();
};

// Create sale for customer
const createSaleForCustomer = (customer) => {
  router.push(`/pos?customer=${customer.id}`);
};

// Confirm delete customer
const confirmDelete = (customer) => {
  // Check if customer has sales
  if (customer.sales_count > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Cannot Delete',
      text: `This customer has ${customer.sales_count} purchase records. Remove the sales first.`,
    });
    return;
  }
  
  Swal.fire({
    title: 'Are you sure?',
    text: `Delete customer: ${customer.name}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/customers/${customer.id}`);
        
        // Remove from lists
        allCustomers.value = allCustomers.value.filter(c => c.id !== customer.id);
        sortAndFilterCustomers();
        
        Swal.fire(
          'Deleted!',
          'Customer has been deleted.',
          'success'
        );
      } catch (err) {
        console.error('Error deleting customer:', err);
        Swal.fire(
          'Error!',
          err.response?.data?.message || 'Failed to delete customer.',
          'error'
        );
      }
    }
  });
};

// Pagination
const totalPages = computed(() => Math.ceil(filteredCustomers.value.length / itemsPerPage));

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

const paginatedCustomers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredCustomers.value.slice(startIndex, endIndex);
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Watch for changes to apply filtering
watch([searchQuery, statusFilter, sortConfig], () => {
  sortAndFilterCustomers();
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

/* Truncate long text */
.text-truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>