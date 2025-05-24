<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Users</h1>
      <router-link 
        v-if="authStore.hasPermission('user-create')" 
        to="/users/create" 
        class="btn btn-primary"
      >
        <i class="bi bi-person-plus me-1"></i> Add User
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
                placeholder="Search users..."
                v-model="searchQuery"
                @input="debouncedSearch"
              />
              <button class="btn btn-outline-secondary" type="button" @click="searchUsers">
                <i class="bi bi-search"></i>
              </button>
            </div>
          </div>
          <div class="col-md-6 d-flex justify-content-md-end mt-3 mt-md-0">
            <select class="form-select w-auto me-2" v-model="roleFilter" @change="filterUsers">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
              <option value="user">User</option>
            </select>
            <select class="form-select w-auto" v-model="statusFilter" @change="filterUsers">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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

    <!-- No users found -->
    <div v-else-if="filteredUsers.length === 0" class="text-center py-5">
      <i class="bi bi-people display-1 text-muted"></i>
      <p class="lead mt-3">No users found</p>
      <p v-if="searchQuery || roleFilter || statusFilter" class="text-muted">
        Try changing your search criteria
      </p>
    </div>

    <!-- Users table -->
    <div v-else class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Roles</th>
              <th scope="col">Status</th>
              <th scope="col">Last Login</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in filteredUsers" :key="user.id">
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="user-avatar me-2">
                    {{ getUserInitials(user.name) }}
                  </div>
                  {{ user.name }}
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <span 
                  v-for="role in user.roles" 
                  :key="role" 
                  class="badge"
                  :class="getRoleBadgeClass(role)"
                >
                  {{ role }}
                </span>
              </td>
              <td>
                <span 
                  class="badge"
                  :class="user.is_active ? 'bg-success' : 'bg-secondary'"
                >
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ user.last_login_at ? formatDate(user.last_login_at) : 'Never' }}</td>
              <td class="text-end">
                <div class="btn-group">
                  <router-link 
                    v-if="authStore.hasPermission('user-edit')" 
                    :to="`/users/${user.id}/edit`" 
                    class="btn btn-sm btn-outline-primary"
                  >
                    <i class="bi bi-pencil"></i>
                  </router-link>
                  <button 
                    v-if="authStore.hasPermission('user-delete') && !isCurrentUser(user.id)" 
                    class="btn btn-sm btn-outline-danger"
                    @click="confirmDelete(user)"
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

// Store
const authStore = useAuthStore();

// Data
const allUsers = ref([]);
const filteredUsers = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const roleFilter = ref('');
const statusFilter = ref('');

// Pagination
const itemsPerPage = 10;
const currentPage = ref(1);
const totalItems = ref(0);

// Load users
onMounted(async () => {
  // Check permission
  if (!authStore.hasPermission('user-list')) {
    error.value = 'You do not have permission to view users';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    
    // Fetch users
    const response = await api.get('/users');
    allUsers.value = response.data.data;
    
    // Initial filtering and pagination
    filterUsers();
    
    error.value = null;
  } catch (err) {
    console.error('Error fetching users:', err);
    error.value = 'Failed to load users. Please try again later.';
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

// Get user initials
const getUserInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Get role badge class
const getRoleBadgeClass = (role) => {
  const roleClasses = {
    'admin': 'bg-danger',
    'manager': 'bg-primary',
    'cashier': 'bg-info',
    'user': 'bg-secondary'
  };
  
  return roleClasses[role] || 'bg-secondary';
};

// Check if the user is the current logged-in user
const isCurrentUser = (userId) => {
  return authStore.user && authStore.user.id === userId;
};

// Debounce search
let searchTimeout;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filterUsers();
  }, 300);
};

// Filter users based on search, role, and status
const filterUsers = () => {
  let filtered = [...allUsers.value];
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    );
  }
  
  // Apply role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => 
      user.roles.includes(roleFilter.value)
    );
  }
  
  // Apply status filter
  if (statusFilter.value) {
    const isActive = statusFilter.value === 'active';
    filtered = filtered.filter(user => user.is_active === isActive);
  }
  
  // Update total items for pagination
  totalItems.value = filtered.length;
  
  // Apply pagination
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  filteredUsers.value = filtered.slice(startIndex, endIndex);
  
  // Reset to first page if no results on current page
  if (filteredUsers.value.length === 0 && totalItems.value > 0) {
    currentPage.value = 1;
    filterUsers();
  }
};

// Search users
const searchUsers = () => {
  currentPage.value = 1; // Reset to first page
  filterUsers();
};

// Watch for filter changes
watch([roleFilter, statusFilter], () => {
  currentPage.value = 1; // Reset to first page
  filterUsers();
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
    filterUsers();
  }
};

// Delete user
const confirmDelete = (user) => {
  // Check if it's the current user
  if (isCurrentUser(user.id)) {
    Swal.fire({
      icon: 'warning',
      title: 'Cannot Delete',
      text: 'You cannot delete your own account',
    });
    return;
  }
  
  Swal.fire({
    title: 'Are you sure?',
    text: `Delete user: ${user.name}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/users/${user.id}`);
        
        // Remove from lists
        allUsers.value = allUsers.value.filter(u => u.id !== user.id);
        filterUsers();
        
        Swal.fire(
          'Deleted!',
          'User has been deleted.',
          'success'
        );
      } catch (err) {
        console.error('Error deleting user:', err);
        Swal.fire(
          'Error!',
          err.response?.data?.message || 'Failed to delete user.',
          'error'
        );
      }
    }
  });
};
</script>

<style scoped>
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #0d6efd;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.badge {
  margin-right: 0.25rem;
}
</style>