<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>System Settings</h1>
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

    <!-- Settings form -->
    <form v-else @submit.prevent="saveSettings" class="needs-validation" novalidate>
      <div class="row">
        <!-- Company Information -->
        <div class="col-lg-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Company Information</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="company_name" class="form-label">Company Name <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  id="company_name"
                  v-model="settings.company_name"
                  required
                  :class="{ 'is-invalid': errors.company_name }"
                >
                <div class="invalid-feedback">{{ errors.company_name }}</div>
              </div>

              <div class="mb-3">
                <label for="company_email" class="form-label">Email Address</label>
                <input
                  type="email"
                  class="form-control"
                  id="company_email"
                  v-model="settings.company_email"
                  :class="{ 'is-invalid': errors.company_email }"
                >
                <div class="invalid-feedback">{{ errors.company_email }}</div>
              </div>

              <div class="mb-3">
                <label for="company_phone" class="form-label">Phone Number</label>
                <input
                  type="tel"
                  class="form-control"
                  id="company_phone"
                  v-model="settings.company_phone"
                  :class="{ 'is-invalid': errors.company_phone }"
                >
                <div class="invalid-feedback">{{ errors.company_phone }}</div>
              </div>

              <div class="mb-3">
                <label for="company_address" class="form-label">Address</label>
                <textarea
                  class="form-control"
                  id="company_address"
                  v-model="settings.company_address"
                  rows="3"
                  :class="{ 'is-invalid': errors.company_address }"
                ></textarea>
                <div class="invalid-feedback">{{ errors.company_address }}</div>
              </div>

              <div class="mb-3">
                <label for="tax_number" class="form-label">Tax/VAT Number</label>
                <input
                  type="text"
                  class="form-control"
                  id="tax_number"
                  v-model="settings.tax_number"
                  :class="{ 'is-invalid': errors.tax_number }"
                >
                <div class="invalid-feedback">{{ errors.tax_number }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Settings -->
        <div class="col-lg-6 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">System Settings</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="currency" class="form-label">Currency <span class="text-danger">*</span></label>
                <select
                  class="form-select"
                  id="currency"
                  v-model="settings.currency"
                  required
                  :class="{ 'is-invalid': errors.currency }"
                >
                  <option value="IDR">Indonesian Rupiah (IDR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                  <option value="JPY">Japanese Yen (JPY)</option>
                  <option value="SGD">Singapore Dollar (SGD)</option>
                  <option value="MYR">Malaysian Ringgit (MYR)</option>
                </select>
                <div class="invalid-feedback">{{ errors.currency }}</div>
              </div>

              <div class="mb-3">
                <label for="tax_rate" class="form-label">Default Tax Rate (%)</label>
                <div class="input-group">
                  <input
                    type="number"
                    class="form-control"
                    id="tax_rate"
                    v-model="settings.tax_rate"
                    min="0"
                    max="100"
                    step="0.01"
                    :class="{ 'is-invalid': errors.tax_rate }"
                  >
                  <span class="input-group-text">%</span>
                  <div class="invalid-feedback">{{ errors.tax_rate }}</div>
                </div>
                <div class="form-text">This rate will be applied to all sales by default</div>
              </div>

              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="invoice_auto_print"
                  v-model="settings.invoice_auto_print"
                >
                <label class="form-check-label" for="invoice_auto_print">
                  Automatically print invoice after completing a sale
                </label>
              </div>
            </div>
          </div>

          <!-- Logo Settings -->
          <div class="card mt-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Logo & Branding</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="logo" class="form-label">Company Logo</label>
                <div class="d-flex align-items-center mb-2">
                  <div v-if="settings.logo || logoPreview" class="me-3 logo-preview">
                    <img
                      :src="logoPreview || settings.logo"
                      alt="Company Logo"
                      class="img-thumbnail"
                    >
                    <button
                      type="button"
                      class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      @click="removeLogo"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
                <input
                  type="file"
                  class="form-control"
                  id="logo"
                  @change="handleLogoChange"
                  accept="image/*"
                  :class="{ 'is-invalid': errors.logo }"
                >
                <div class="invalid-feedback">{{ errors.logo }}</div>
                <div class="form-text">Recommended size: 200x80 pixels (PNG or JPEG)</div>
              </div>

              <div class="mb-3">
                <label for="favicon" class="form-label">Favicon</label>
                <div class="d-flex align-items-center mb-2">
                  <div v-if="settings.favicon || faviconPreview" class="me-3 favicon-preview">
                    <img
                      :src="faviconPreview || settings.favicon"
                      alt="Favicon"
                      class="img-thumbnail"
                    >
                    <button
                      type="button"
                      class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                      @click="removeFavicon"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
                <input
                  type="file"
                  class="form-control"
                  id="favicon"
                  @change="handleFaviconChange"
                  accept="image/*"
                  :class="{ 'is-invalid': errors.favicon }"
                >
                <div class="invalid-feedback">{{ errors.favicon }}</div>
                <div class="form-text">Recommended size: 32x32 pixels (PNG or ICO)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="card mb-4">
        <div class="card-body d-flex justify-content-end">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Save Settings
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { useAuthStore } from '../../stores/auth';

// Store
const authStore = useAuthStore();

// State
const settings = ref({
  company_name: '',
  company_email: '',
  company_phone: '',
  company_address: '',
  tax_number: '',
  tax_rate: 0,
  currency: 'IDR',
  logo: null,
  favicon: null,
  invoice_auto_print: false
});
const loading = ref(true);
const submitting = ref(false);
const errors = ref({});
const error = ref(null);

// File uploads
const logoFile = ref(null);
const logoPreview = ref(null);
const faviconFile = ref(null);
const faviconPreview = ref(null);

// Load settings
onMounted(async () => {
  // Check permission
  if (!authStore.hasPermission('setting-edit')) {
    error.value = 'You do not have permission to access this page';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    
    // Fetch settings
    const response = await api.get('/settings');
    const data = response.data.data;
    
    // Update settings state
    settings.value = {
      company_name: data.company_name || '',
      company_email: data.company_email || '',
      company_phone: data.company_phone || '',
      company_address: data.company_address || '',
      tax_number: data.tax_number || '',
      tax_rate: data.tax_rate || 0,
      currency: data.currency || 'IDR',
      logo: data.logo || null,
      favicon: data.favicon || null,
      invoice_auto_print: data.invoice_auto_print || false
    };
    
    error.value = null;
  } catch (err) {
    console.error('Error loading settings:', err);
    error.value = 'Failed to load settings. Please try again.';
  } finally {
    loading.value = false;
  }
});

// Handle logo file upload
const handleLogoChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.value.logo = 'Please upload a valid image (JPEG, PNG, GIF)';
    return;
  }
  
  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    errors.value.logo = 'Image size should not exceed 2MB';
    return;
  }
  
  // Clear previous error
  errors.value.logo = null;
  
  // Set logo file for upload
  logoFile.value = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    logoPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Remove logo
const removeLogo = () => {
  logoFile.value = null;
  logoPreview.value = null;
  settings.value.logo = null;
  
  // Reset file input
  const fileInput = document.getElementById('logo');
  if (fileInput) fileInput.value = '';
};

// Handle favicon file upload
const handleFaviconChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/x-icon'];
  if (!allowedTypes.includes(file.type)) {
    errors.value.favicon = 'Please upload a valid image (JPEG, PNG, GIF, ICO)';
    return;
  }
  
  // Validate file size (max 1MB)
  const maxSize = 1 * 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    errors.value.favicon = 'Image size should not exceed 1MB';
    return;
  }
  
  // Clear previous error
  errors.value.favicon = null;
  
  // Set favicon file for upload
  faviconFile.value = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    faviconPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Remove favicon
const removeFavicon = () => {
  faviconFile.value = null;
  faviconPreview.value = null;
  settings.value.favicon = null;
  
  // Reset file input
  const fileInput = document.getElementById('favicon');
  if (fileInput) fileInput.value = '';
};

// Save settings
const saveSettings = async () => {
  submitting.value = true;
  errors.value = {};
  
  try {
    // Validate form
    if (!settings.value.company_name.trim()) {
      errors.value.company_name = 'Company name is required';
      submitting.value = false;
      return;
    }
    
    if (!settings.value.currency) {
      errors.value.currency = 'Currency is required';
      submitting.value = false;
      return;
    }
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('company_name', settings.value.company_name);
    formData.append('company_email', settings.value.company_email || '');
    formData.append('company_phone', settings.value.company_phone || '');
    formData.append('company_address', settings.value.company_address || '');
    formData.append('tax_number', settings.value.tax_number || '');
    formData.append('tax_rate', settings.value.tax_rate || 0);
    formData.append('currency', settings.value.currency);
    formData.append('invoice_auto_print', settings.value.invoice_auto_print ? 1 : 0);
    
    // Only append logo if a new one is selected
    if (logoFile.value) {
      formData.append('logo', logoFile.value);
    }
    
    // Only append favicon if a new one is selected
    if (faviconFile.value) {
      formData.append('favicon', faviconFile.value);
    }
    
    // Send update request
    await api.post('/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Show success message
    // Tampilkan toast sukses
  Swal.fire({
    icon: 'success',
    title: 'Settings Updated',
    text: 'System settings have been updated successfully',
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

  // Reset file inputs
  logoFile.value = null;
  logoPreview.value = null;
  faviconFile.value = null;
  faviconPreview.value = null;

  // // Redirect setelah toast tampil
  // setTimeout(() => {
  //   router.push('/settings');
  // }, 3100); // delay sedikit supaya user sempat lihat toast

} catch (err) {
  console.error('Error saving settings:', err);

  if (err.response?.status === 422 && err.response?.data?.errors) {
    const validationErrors = err.response.data.errors;
    Object.keys(validationErrors).forEach(key => {
      errors.value[key] = validationErrors[key][0];
    });

  } else {
    // Tampilkan error toast
    Swal.fire({
      icon: 'error',
      title: 'Update Failed',
      text: err.response?.data?.message || 'Failed to update settings',
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
} finally {
  submitting.value = false;
}
};
</script>

<style scoped>
.logo-preview {
  position: relative;
  max-width: 200px;
  max-height: 80px;
  margin-bottom: 10px;
  display: inline-block;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.favicon-preview {
  position: relative;
  width: 32px;
  height: 32px;
  margin-bottom: 10px;
  display: inline-block;
}

.favicon-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>