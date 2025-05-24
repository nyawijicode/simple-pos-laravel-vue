<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Products</h1>
      <router-link 
        v-if="authStore.hasPermission('product-create')" 
        to="/products/create" 
        class="btn btn-primary"
      >
        <i class="bi bi-plus-circle me-1"></i> Add Product
      </router-link>
    </div>

    <!-- Filters and Search -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="Search products..."
                v-model="searchQuery"
                @input="debouncedSearch"
              />
              <button class="btn btn-outline-secondary" type="button" @click="searchProducts">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="selectedCategory" @change="filterProducts">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="stockFilter" @change="filterProducts">
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error Message -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- No Products Found -->
    <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
      <i class="bi bi-box display-1 text-muted"></i>
      <p class="lead mt-3">No products found</p>
      <p class="text-muted">Try changing your search criteria or add a new product.</p>
    </div>

    <!-- Products Grid -->
    <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
      <div v-for="product in filteredProducts" :key="product.id" class="col">
        <div class="card h-100 product-card">
          <div class="product-image">
            <img v-if="product.image" :src="product.image" class="card-img-top" :alt="product.name" />
            <div v-else class="no-image d-flex align-items-center justify-content-center">
              <i class="bi bi-box"></i>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ product.name }}</h5>
            <p class="card-text mb-1">Code: {{ product.code }}</p>
            <p class="card-text mb-1">Price: {{ $formatCurrency(product.price) }}</p>
            <p class="card-text mb-1">
              <span 
                :class="{
                  'badge bg-success': product.stock > product.alert_stock,
                  'badge bg-warning text-dark': product.stock > 0 && product.stock <= product.alert_stock,
                  'badge bg-danger': product.stock <= 0
                }"
              >
                Stock: {{ product.stock }}
              </span>
            </p>
            <p class="card-text mb-0">
              <small class="text-muted">Category: {{ product.category?.name || 'Uncategorized' }}</small>
            </p>
          </div>
          <div class="card-footer bg-transparent d-flex justify-content-between">
            <div v-if="authStore.hasPermission('product-edit')">
              <router-link 
                :to="`/products/${product.id}/edit`" 
                class="btn btn-sm btn-outline-primary me-2"
              >
                <i class="bi bi-pencil"></i> Edit
              </router-link>
            </div>
            <button 
              v-if="authStore.hasPermission('product-delete')" 
              class="btn btn-sm btn-outline-danger"
              @click="confirmDelete(product)"
            >
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
      <nav>
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Previous</a>
          </li>
          <li 
            v-for="page in paginationItems" 
            :key="page"
            class="page-item" 
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
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

// Stores
const authStore = useAuthStore();

// Data
const allProducts = ref([]);
const filteredProducts = ref([]);
const categories = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const selectedCategory = ref('');
const stockFilter = ref('all');

// Pagination
const itemsPerPage = 12;
const currentPage = ref(1);
const totalItems = ref(0);

// Load products and categories
onMounted(async () => {
  try {
    loading.value = true;
    
    // Fetch products and categories in parallel
    const [productsResponse, categoriesResponse] = await Promise.all([
      api.get('/products'),
      api.get('/categories')
    ]);
    
    allProducts.value = productsResponse.data.data;
    categories.value = categoriesResponse.data.data;
    
    // Initial filtering and pagination
    filterProducts();
    
    error.value = null;
  } catch (err) {
    console.error('Error fetching data:', err);
    error.value = 'Failed to load products. Please try again later.';
  } finally {
    loading.value = false;
  }
});

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filterProducts();
  }, 300);
};

// Filter products based on search, category, and stock
const filterProducts = () => {
  let filtered = [...allProducts.value];
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.code.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
  }
  
  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter(product => product.category_id === parseInt(selectedCategory.value));
  }
  
  // Apply stock filter
  if (stockFilter.value !== 'all') {
    switch (stockFilter.value) {
      case 'in_stock':
        filtered = filtered.filter(product => product.stock > product.alert_stock);
        break;
      case 'low_stock':
        filtered = filtered.filter(product => product.stock > 0 && product.stock <= product.alert_stock);
        break;
      case 'out_of_stock':
        filtered = filtered.filter(product => product.stock <= 0);
        break;
    }
  }
  
  // Update total items for pagination
  totalItems.value = filtered.length;
  
  // Apply pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  filteredProducts.value = filtered.slice(startIndex, endIndex);
  
  // Reset to first page if no results on current page
  if (filteredProducts.value.length === 0 && totalItems.value > 0) {
    currentPage.value = 1;
    filterProducts();
  }
};

// Search products
const searchProducts = () => {
  currentPage.value = 1; // Reset to first page
  filterProducts();
};

// Watch for filter changes
watch([selectedCategory, stockFilter], () => {
  currentPage.value = 1; // Reset to first page
  filterProducts();
});

// Pagination
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

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

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    filterProducts();
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Delete product
const confirmDelete = (product) => {
  Swal.fire({
    title: 'Are you sure?',
    text: `Delete product: ${product.name}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
    reverseButtons: true, // tombol cancel di kiri
    focusCancel: true
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/products/${product.id}`);

        // Hapus dari daftar lokal
        allProducts.value = allProducts.value.filter(p => p.id !== product.id);
        filterProducts();

        // Tampilkan TOAST sukses
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Product has been deleted.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });

        // Redirect ke halaman products
        setTimeout(() => {
          router.push('/products');
        }, 3100);
        
      } catch (err) {
        console.error('Error deleting product:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err.response?.data?.message || 'Failed to delete product.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });
      }
    }
  });
};

</script>

<style scoped>
.product-card {
  transition: all 0.2s ease-in-out;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  overflow: hidden;
}

.product-image img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.no-image {
  height: 100%;
  width: 100%;
  color: #adb5bd;
  font-size: 3rem;
}

.card-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>