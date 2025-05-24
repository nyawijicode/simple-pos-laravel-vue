<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Categories</h1>
      <router-link 
        v-if="authStore.hasPermission('category-create')" 
        to="/categories/create" 
        class="btn btn-primary"
      >
        <i class="bi bi-plus-circle me-1"></i> Add Category
      </router-link>
    </div>

    <!-- Search Bar -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="input-group">
              <input
                type="text"
                class="form-control"
                placeholder="Search categories..."
                v-model="searchQuery"
                @input="debouncedSearch"
              />
              <button class="btn btn-outline-secondary" type="button" @click="searchCategories">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6 d-flex justify-content-md-end mt-3 mt-md-0">
            <select v-model="statusFilter" class="form-select w-auto" @change="filterCategories">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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

    <!-- No Categories Found -->
    <div v-else-if="filteredCategories.length === 0" class="text-center py-5">
      <i class="bi bi-tag display-1 text-muted"></i>
      <p class="lead mt-3">No categories found</p>
      <p v-if="searchQuery" class="text-muted">Try changing your search query</p>
      <p v-else-if="authStore.hasPermission('category-create')" class="text-muted">
        Start by adding a new category
      </p>
    </div>

    <!-- Categories Table -->
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Slug</th>
              <th scope="col">Products</th>
              <th scope="col">Status</th>
              <th scope="col">Created</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(category, index) in filteredCategories" :key="category.id">
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ category.name }}</td>
              <td>
                <span class="text-muted">{{ category.slug }}</span>
              </td>
              <td>
                <span class="badge bg-info">{{ category.products_count || 0 }}</span>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="category.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ category.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ formatDate(category.created_at) }}</td>
              <td class="text-end">
                <div class="btn-group">
                  <router-link 
                    v-if="authStore.hasPermission('category-edit')" 
                    :to="`/categories/${category.id}/edit`" 
                    class="btn btn-sm btn-outline-primary"
                  >
                    <i class="bi bi-pencil"></i>
                  </router-link>
                  <button 
                    v-if="authStore.hasPermission('category-delete')" 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(category)"
                    :disabled="category.products_count > 0"
                    :title="category.products_count > 0 ? 'Cannot delete: Category has products' : 'Delete'"
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

// Stores
const authStore = useAuthStore();

// Data
const allCategories = ref([]);
const filteredCategories = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const statusFilter = ref('all');

// Pagination
const itemsPerPage = 10;
const currentPage = ref(1);
const totalItems = ref(0);

// Load categories
onMounted(async () => {
  try {
    loading.value = true;
    
    // Fetch categories
    const response = await api.get('/categories');
    allCategories.value = response.data.data;
    
    // Initial filtering and pagination
    filterCategories();
    
    error.value = null;
  } catch (err) {
    console.error('Error fetching categories:', err);
    error.value = 'Failed to load categories. Please try again later.';
  } finally {
    loading.value = false;
  }
});

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filterCategories();
  }, 300);
};

// Filter categories based on search and status
const filterCategories = () => {
  let filtered = [...allCategories.value];
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(category => 
      category.name.toLowerCase().includes(query) || 
      category.slug.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    );
  }
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active';
    filtered = filtered.filter(category => category.is_active === isActive);
  }
  
  // Update total items for pagination
  totalItems.value = filtered.length;
  
  // Apply pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  filteredCategories.value = filtered.slice(startIndex, endIndex);
  
  // Reset to first page if no results on current page
  if (filteredCategories.value.length === 0 && totalItems.value > 0) {
    currentPage.value = 1;
    filterCategories();
  }
};

// Search categories
const searchCategories = () => {
  currentPage.value = 1; // Reset to first page
  filterCategories();
};

// Watch for filter changes
watch(statusFilter, () => {
  currentPage.value = 1; // Reset to first page
  filterCategories();
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
    filterCategories();
  }
};

// Delete category
const confirmDelete = (category) => {
  // Check if category has products
  if (category.products_count > 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Cannot Delete',
      text: `The category "${category.name}" has ${category.products_count} products associated with it. Remove the products first.`,
    });
    return;
  }
  
  Swal.fire({
    title: 'Are you sure?',
    text: `Delete category: ${category.name}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/categories/${category.id}`);
        
        // Remove from lists
        allCategories.value = allCategories.value.filter(c => c.id !== category.id);
        filterCategories();
        
        Swal.fire(
          'Deleted!',
          'Category has been deleted.',
          'success'
        );
      } catch (err) {
        console.error('Error deleting category:', err);
        Swal.fire(
          'Error!',
          err.response?.data?.message || 'Failed to delete category.',
          'error'
        );
      }
    }
  });
};
</script>

<style scoped>
/* Add any category-specific styling here */
</style>