<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
      <h1 class="mb-2 mb-md-0">{{ isEditMode ? 'Edit User' : 'Add New User' }}</h1>
      <router-link to="/users" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i> Back to Users
      </router-link>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error message -->
    <div v-else-if="error" class="alert alert-danger alert-dismissible fade show">
      {{ error }}
      <button type="button" class="btn-close" @click="error = null" aria-label="Close"></button>
    </div>

    <!-- User form -->
    <form v-else @submit.prevent="handleSubmit" class="needs-validation" novalidate>
      <div class="row g-4">
        <!-- Basic Information -->
        <div class="col-lg-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="bi bi-person-vcard me-2"></i>Basic Information
              </h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="name" class="form-label fw-semibold">Name <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control form-control-lg"
                  id="name"
                  v-model="user.name"
                  required
                  :class="{ 'is-invalid': errors.name }"
                  autofocus
                  placeholder="Enter full name"
                />
                <div class="invalid-feedback">{{ errors.name }}</div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label fw-semibold">Email <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="user.email"
                    required
                    :class="{ 'is-invalid': errors.email }"
                    placeholder="email@example.com"
                  />
                  <div class="invalid-feedback">{{ errors.email }}</div>
                </div>
              </div>

              <div class="mb-3">
                <label for="phone" class="form-label fw-semibold">Phone Number</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                  <input
                    type="tel"
                    class="form-control"
                    id="phone"
                    v-model="user.phone"
                    :class="{ 'is-invalid': errors.phone }"
                    placeholder="+1234567890"
                  />
                  <div class="invalid-feedback">{{ errors.phone }}</div>
                </div>
              </div>

              <div class="mb-3">
                <label for="address" class="form-label fw-semibold">Address</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
                  <textarea
                    class="form-control"
                    id="address"
                    v-model="user.address"
                    rows="3"
                    :class="{ 'is-invalid': errors.address }"
                    placeholder="Enter address"
                  ></textarea>
                  <div class="invalid-feedback">{{ errors.address }}</div>
                </div>
              </div>

              <div class="form-check form-switch">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="is_active"
                  v-model="user.is_active"
                />
                <label class="form-check-label" for="is_active">Active Account</label>
                <div class="form-text text-muted">
                  <i class="bi bi-info-circle me-1"></i>
                  Inactive users cannot log in to the system
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Password & Roles -->
        <div class="col-lg-6 d-flex flex-column">
          <!-- Password Section -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="bi bi-shield-lock me-2"></i>{{ isEditMode ? 'Change Password' : 'Password' }}
              </h5>
            </div>
            <div class="card-body">
              <div v-if="!isEditMode">
                <div class="mb-3">
                  <label for="password" class="form-label fw-semibold">Password <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-key"></i></span>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      v-model="user.password"
                      :required="!isEditMode"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                    <div class="invalid-feedback">{{ errors.password }}</div>
                  </div>
                  <div class="form-text">
                    <i class="bi bi-info-circle me-1"></i>
                    Password must be at least 8 characters long
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password_confirmation" class="form-label fw-semibold">Confirm Password <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-key-fill"></i></span>
                    <input
                      :type="showPasswordConfirmation ? 'text' : 'password'"
                      class="form-control"
                      id="password_confirmation"
                      v-model="user.password_confirmation"
                      :required="!isEditMode"
                      :class="{ 'is-invalid': errors.password_confirmation }"
                      placeholder="Confirm password"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPasswordConfirmation = !showPasswordConfirmation"
                    >
                      <i class="bi" :class="showPasswordConfirmation ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                    <div class="invalid-feedback">{{ errors.password_confirmation }}</div>
                  </div>
                </div>
              </div>

              <div v-else>
                <div class="mb-3">
                  <label for="password" class="form-label fw-semibold">New Password</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-key"></i></span>
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control"
                      id="password"
                      v-model="user.password"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="Leave blank to keep current password"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPassword = !showPassword"
                    >
                      <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                    <div class="invalid-feedback">{{ errors.password }}</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password_confirmation" class="form-label fw-semibold">Confirm New Password</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-key-fill"></i></span>
                    <input
                      :type="showPasswordConfirmation ? 'text' : 'password'"
                      class="form-control"
                      id="password_confirmation"
                      v-model="user.password_confirmation"
                      :class="{ 'is-invalid': errors.password_confirmation }"
                      placeholder="Confirm new password"
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="showPasswordConfirmation = !showPasswordConfirmation"
                    >
                      <i class="bi" :class="showPasswordConfirmation ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                    <div class="invalid-feedback">{{ errors.password_confirmation }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Roles Section -->
          <div class="card shadow-sm flex-grow-1">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                <i class="bi bi-person-badge me-2"></i>User Roles <span class="text-danger">*</span>
              </h5>
            </div>
            <div class="card-body">
              <div class="alert alert-info mb-3">
                <i class="bi bi-info-circle-fill me-2"></i>
                Select at least one role for this user. Each role has different permissions.
              </div>
              
              <div class="role-selection" :class="{ 'is-invalid': errors.roles }">
                <div v-for="role in availableRoles" :key="role.id" class="role-option mb-2">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="`role_${role.name}`"
                      :value="role.name"
                      v-model="user.roles"
                    />
                    <label class="form-check-label" :for="`role_${role.name}`">
                      <span class="fw-bold">{{ role.display_name }}</span>
                      <span class="d-block text-muted small">{{ role.description }}</span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="text-danger mt-2" v-if="errors.roles">{{ errors.roles }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Buttons -->
      <div class="card shadow-sm mt-4">
        <div class="card-body d-flex justify-content-between flex-wrap">
          <button type="button" class="btn btn-outline-secondary mb-2 mb-md-0" @click="$router.push('/users')">
            <i class="bi bi-x-circle me-1"></i> Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            <i v-else class="bi" :class="isEditMode ? 'bi-save' : 'bi-plus-circle'"></i>
            {{ isEditMode ? 'Update User' : 'Create User' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Router and store
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const user = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  address: '',
  is_active: true,
  roles: []
});
const availableRoles = ref([
  { 
    name: 'admin', 
    display_name: 'Administrator',
    description: 'Full access to all system features'
  },
  { 
    name: 'manager', 
    display_name: 'Manager',
    description: 'Can manage products, categories, customers, and sales'
  },
  { 
    name: 'cashier', 
    display_name: 'Cashier',
    description: 'Can process sales and manage customers'
  },
  { 
    name: 'user', 
    display_name: 'User',
    description: 'Limited access - can only view products and sales'
  }
]);
const loading = ref(true);
const submitting = ref(false);
const errors = ref({});
const error = ref(null);
const showPassword = ref(false);
const showPasswordConfirmation = ref(false);

// Computed
const isEditMode = computed(() => !!route.params.id);
const userId = computed(() => route.params.id);
const isCurrentUser = computed(() => {
  return authStore.user && parseInt(userId.value) === authStore.user.id;
});

// Lifecycle hooks
onMounted(async () => {
  // Check permissions
  if ((isEditMode.value && !authStore.hasPermission('user-edit')) || 
      (!isEditMode.value && !authStore.hasPermission('user-create'))) {
    error.value = 'You do not have permission to perform this action';
    loading.value = false;
    return;
  }

  if (isEditMode.value) {
    try {
      loading.value = true;
      
      const response = await api.get(`/users/${userId.value}`);
      const userData = response.data;
      
      // Update user state
      user.value = {
        name: userData.name,
        email: userData.email,
        password: '',
        password_confirmation: '',
        phone: userData.phone || '',
        address: userData.address || '',
        is_active: userData.is_active,
        roles: userData.roles || []
      };
      
      error.value = null;
    } catch (err) {
      console.error('Error loading user:', err);
      error.value = 'Failed to load user data. Please try again.';
    } finally {
      loading.value = false;
    }
  } else {
    // For new user, just set loading to false
    loading.value = false;
  }
});

// Methods
const validateForm = () => {
  const newErrors = {};
  
  // Required fields
  if (!user.value.name.trim()) {
    newErrors.name = 'Name is required';
  }
  
  if (!user.value.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!isValidEmail(user.value.email)) {
    newErrors.email = 'Please enter a valid email address';
  }
  
  // Password validation for new users or if password is provided
  if (!isEditMode.value || user.value.password) {
    if (!isEditMode.value && !user.value.password) {
      newErrors.password = 'Password is required';
    } else if (user.value.password && user.value.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (user.value.password !== user.value.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
  }
  
  // Role validation
  if (user.value.roles.length === 0) {
    newErrors.roles = 'Please select at least one role';
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  
  submitting.value = true;
  
  try {
    const userData = {
      name: user.value.name,
      email: user.value.email,
      phone: user.value.phone,
      address: user.value.address,
      is_active: user.value.is_active,
      roles: user.value.roles
    };
    
    // Only include password if it's provided
    if (user.value.password) {
      userData.password = user.value.password;
      userData.password_confirmation = user.value.password_confirmation;
    }
    
    let response;
    if (isEditMode.value) {
      response = await api.put(`/users/${userId.value}`, userData);
      
      // If current user is updated, refresh auth user data
      if (isCurrentUser.value) {
        await authStore.fetchUser();
      }
    } else {
      response = await api.post('/users', userData);
    }
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: isEditMode.value ? 'User Updated' : 'User Created',
      text: isEditMode.value 
        ? `${user.value.name} has been updated successfully` 
        : `${user.value.name} has been added as a new user`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInRight'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutRight'
      }
    });
    
    // Redirect to users list
    router.push('/users');
    
  } catch (err) {
    console.error('Error submitting form:', err);
    
    // Handle validation errors
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const validationErrors = err.response.data.errors;
      const newErrors = {};
      
      Object.keys(validationErrors).forEach(key => {
        newErrors[key] = validationErrors[key][0];
      });
      
      errors.value = newErrors;
      
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'An error occurred while saving the user',
        position: 'top',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.role-selection {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  max-height: 300px;
  overflow-y: auto;
}

.role-selection.is-invalid {
  border-color: #dc3545;
}

.role-option {
  padding: 0.75rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.role-option:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* Card enhancements */
.card {
  transition: all 0.3s ease;
  border: none;
  border-radius: 0.5rem;
}

.card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.card-header {
  border-bottom: 1px solid rgba(0,0,0,.05);
  border-radius: 0.5rem 0.5rem 0 0 !important;
}

/* Buttons styling */
.btn {
  border-radius: 0.35rem;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #0d6efd;
}

.btn-primary:hover {
  background-color: #0b5ed7;
  transform: translateY(-2px);
}

.btn-outline-secondary:hover {
  transform: translateY(-2px);
}

/* Form control enhancements */
.form-control, .input-group-text {
  border-radius: 0.35rem;
}

.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
}

/* Responsive adjustments */
@media (max-width: 576px) {
  .card-body {
    padding: 1rem;
  }
  
  .role-option {
    padding: 0.5rem;
  }
}

/* Add animation for better UX */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.card, .form-control, .alert {
  animation: fadeIn 0.3s ease-out;
}
</style>