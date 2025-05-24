artifacttitle: "Profile Component"
type: "application/vnd.ant.code"
language: "vue"
id: "profile-component"
vue<!-- src/components/auth/Profile.vue -->
<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>My Profile</h1>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error message -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Profile content -->
    <div v-else class="row">
      <!-- Profile Information -->
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Profile Information</h5>
            <button 
              type="button" 
              class="btn btn-sm btn-outline-primary" 
              @click="editMode = !editMode"
            >
              <i class="bi" :class="editMode ? 'bi-x-lg' : 'bi-pencil'"></i>
              {{ editMode ? 'Cancel' : 'Edit' }}
            </button>
          </div>
          <div class="card-body">
            <form v-if="editMode" @submit.prevent="updateProfile">
              <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="name" 
                  v-model="profileForm.name"
                  :class="{ 'is-invalid': profileErrors.name }"
                  required
                >
                <div class="invalid-feedback">{{ profileErrors.name }}</div>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="profileForm.email"
                  :class="{ 'is-invalid': profileErrors.email }"
                  required
                >
                <div class="invalid-feedback">{{ profileErrors.email }}</div>
              </div>
              <div class="mb-3">
                <label for="phone" class="form-label">Phone Number</label>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phone" 
                  v-model="profileForm.phone"
                  :class="{ 'is-invalid': profileErrors.phone }"
                >
                <div class="invalid-feedback">{{ profileErrors.phone }}</div>
              </div>
              <div class="mb-3">
                <label for="address" class="form-label">Address</label>
                <textarea 
                  class="form-control" 
                  id="address" 
                  rows="3" 
                  v-model="profileForm.address"
                  :class="{ 'is-invalid': profileErrors.address }"
                ></textarea>
                <div class="invalid-feedback">{{ profileErrors.address }}</div>
              </div>
              <div class="d-grid">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  :disabled="profileSubmitting"
                >
                  <span v-if="profileSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Save Changes
                </button>
              </div>
            </form>

            <!-- Profile display -->
            <div v-else>
              <div class="text-center mb-4">
                <div class="avatar-container mx-auto">
                  <div class="avatar">
                    {{ userInitials }}
                  </div>
                </div>
                <h5 class="mt-3">{{ user.name }}</h5>
                <div class="badge bg-primary mb-2" v-for="role in user.roles" :key="role">
                  {{ role }}
                </div>
              </div>
              
              <div class="profile-info">
                <div class="profile-item">
                  <div class="profile-label">
                    <i class="bi bi-envelope me-2"></i>Email
                  </div>
                  <div class="profile-value">{{ user.email }}</div>
                </div>
                
                <div class="profile-item" v-if="user.phone">
                  <div class="profile-label">
                    <i class="bi bi-telephone me-2"></i>Phone
                  </div>
                  <div class="profile-value">{{ user.phone }}</div>
                </div>
                
                <div class="profile-item" v-if="user.address">
                  <div class="profile-label">
                    <i class="bi bi-geo-alt me-2"></i>Address
                  </div>
                  <div class="profile-value">{{ user.address }}</div>
                </div>
                
                <div class="profile-item">
                  <div class="profile-label">
                    <i class="bi bi-calendar3 me-2"></i>Member Since
                  </div>
                  <div class="profile-value">{{ formatDate(user.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="col-lg-6 mb-4">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Change Password</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updatePassword">
              <div class="mb-3">
                <label for="current_password" class="form-label">Current Password</label>
                <div class="input-group">
                  <input 
                    :type="showCurrentPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="current_password" 
                    v-model="passwordForm.current_password"
                    :class="{ 'is-invalid': passwordErrors.current_password }"
                    required
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <i class="bi" :class="showCurrentPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                  <div class="invalid-feedback">{{ passwordErrors.current_password }}</div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="new_password" class="form-label">New Password</label>
                <div class="input-group">
                  <input 
                    :type="showNewPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="new_password" 
                    v-model="passwordForm.new_password"
                    :class="{ 'is-invalid': passwordErrors.new_password }"
                    required
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                  >
                    <i class="bi" :class="showNewPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                  <div class="invalid-feedback">{{ passwordErrors.new_password }}</div>
                </div>
                <div class="form-text">
                  Password must be at least 8 characters long
                </div>
              </div>
              
              <div class="mb-3">
                <label for="new_password_confirmation" class="form-label">Confirm New Password</label>
                <div class="input-group">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    class="form-control" 
                    id="new_password_confirmation" 
                    v-model="passwordForm.new_password_confirmation"
                    :class="{ 'is-invalid': passwordErrors.new_password_confirmation }"
                    required
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                  <div class="invalid-feedback">{{ passwordErrors.new_password_confirmation }}</div>
                </div>
              </div>
              
              <div class="d-grid">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  :disabled="passwordSubmitting"
                >
                  <span v-if="passwordSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Activity Log (if needed in the future) -->
      <div class="col-12 mb-4" v-if="showActivityLog">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Activity Log</h5>
          </div>
          <div class="card-body">
            <p class="text-muted">Activity log will be available in a future update.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Store
const authStore = useAuthStore();

// State
const user = ref({});
const loading = ref(true);
const error = ref(null);
const editMode = ref(false);
const showActivityLog = ref(false); // Set to true when activity log is implemented

// Profile form
const profileForm = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
});
const profileErrors = ref({});
const profileSubmitting = ref(false);

// Password form
const passwordForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
});
const passwordErrors = ref({});
const passwordSubmitting = ref(false);

// Toggle password visibility
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Computed properties
const userInitials = computed(() => {
  if (!user.value.name) return '';
  
  return user.value.name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

// Format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Load user data
onMounted(async () => {
  try {
    loading.value = true;
    
    // Get user data
    const response = await api.get('/user');
    user.value = response.data;
    
    // Initialize profile form
    profileForm.value = {
      name: user.value.name || '',
      email: user.value.email || '',
      phone: user.value.phone || '',
      address: user.value.address || ''
    };
    
    error.value = null;
  } catch (err) {
    console.error('Error loading user profile:', err);
    error.value = 'Failed to load profile data. Please try again.';
  } finally {
    loading.value = false;
  }
});

// Update profile
const updateProfile = async () => {
  profileSubmitting.value = true;
  profileErrors.value = {};
  
  try {
    // Validate form
    if (!profileForm.value.name.trim()) {
      profileErrors.value.name = 'Name is required';
      profileSubmitting.value = false;
      return;
    }
    
    if (!profileForm.value.email.trim()) {
      profileErrors.value.email = 'Email is required';
      profileSubmitting.value = false;
      return;
    }
    
    // Send update request
    const response = await api.put(`/users/${user.value.id}`, profileForm.value);
    
    // Update local data
    user.value = response.data.data;
    
    // Update auth store
    await authStore.fetchUser();
    
    // Exit edit mode
    editMode.value = false;
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Profile Updated',
      text: 'Your profile information has been updated successfully',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    
    // Handle validation errors
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const validationErrors = err.response.data.errors;
      
      Object.keys(validationErrors).forEach(key => {
        profileErrors.value[key] = validationErrors[key][0];
      });
    } else {
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || 'Failed to update profile information',
      });
    }
  } finally {
    profileSubmitting.value = false;
  }
};

// Update password
const updatePassword = async () => {
  passwordSubmitting.value = true;
  passwordErrors.value = {};
  
  try {
    // Validate passwords
    if (!passwordForm.value.current_password) {
      passwordErrors.value.current_password = 'Current password is required';
      passwordSubmitting.value = false;
      return;
    }
    
    if (!passwordForm.value.new_password) {
      passwordErrors.value.new_password = 'New password is required';
      passwordSubmitting.value = false;
      return;
    }
    
    if (passwordForm.value.new_password.length < 8) {
      passwordErrors.value.new_password = 'Password must be at least 8 characters long';
      passwordSubmitting.value = false;
      return;
    }
    
    if (passwordForm.value.new_password !== passwordForm.value.new_password_confirmation) {
      passwordErrors.value.new_password_confirmation = 'Passwords do not match';
      passwordSubmitting.value = false;
      return;
    }
    
    // Send update request
    await api.put(`/users/${user.value.id}/password`, {
      current_password: passwordForm.value.current_password,
      password: passwordForm.value.new_password,
      password_confirmation: passwordForm.value.new_password_confirmation
    });
    
    // Reset form
    passwordForm.value = {
      current_password: '',
      new_password: '',
      new_password_confirmation: ''
    };
    
    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Password Updated',
      text: 'Your password has been changed successfully',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  } catch (err) {
    console.error('Error updating password:', err);
    
    // Handle validation errors
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const validationErrors = err.response.data.errors;
      
      Object.keys(validationErrors).forEach(key => {
        if (key === 'password') {
          passwordErrors.value.new_password = validationErrors[key][0];
        } else if (key === 'current_password') {
          passwordErrors.value.current_password = validationErrors[key][0];
        } else {
          passwordErrors.value[key] = validationErrors[key][0];
        }
      });
    } else {
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || 'Failed to update password',
      });
    }
  } finally {
    passwordSubmitting.value = false;
  }
};
</script>

<style scoped>
.avatar-container {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 50%;
  margin-bottom: 15px;
}

.avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0d6efd;
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
}

.profile-info {
  margin-top: 1.5rem;
}

.profile-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.profile-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.profile-label {
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.profile-value {
  word-break: break-word;
}

.badge {
  margin-right: 0.25rem;
}
</style>