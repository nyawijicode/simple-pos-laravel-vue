<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ isEditMode ? 'Edit Customer' : 'Add New Customer' }}</h1>
      <router-link to="/customers" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i> Back to Customers
      </router-link>
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

    <!-- Customer form -->
    <form v-else @submit.prevent="handleSubmit" class="needs-validation" novalidate>
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Customer Information</h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <!-- Customer Name -->
                <div class="col-md-6">
                  <label for="name" class="form-label">Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="name" v-model="customer.name" required
                    :class="{ 'is-invalid': errors.name }" autofocus />
                  <div class="invalid-feedback">{{ errors.name }}</div>
                </div>

                <!-- Email -->
                <div class="col-md-6">
                  <label for="email" class="form-label">Email</label>
                  <input type="email" class="form-control" id="email" v-model="customer.email"
                    :class="{ 'is-invalid': errors.email }" />
                  <div class="invalid-feedback">{{ errors.email }}</div>
                  <div class="form-text">Used for sending receipts and invoices</div>
                </div>

                <!-- Phone Number -->
                <div class="col-md-6">
                  <label for="phone" class="form-label">Phone Number</label>
                  <input type="tel" class="form-control" id="phone" v-model="customer.phone"
                    :class="{ 'is-invalid': errors.phone }" />
                  <div class="invalid-feedback">{{ errors.phone }}</div>
                </div>

                <!-- Active Status -->
                <div class="col-md-6">
                  <label for="is_active" class="form-label">Status</label>
                  <select class="form-select" id="is_active" v-model="customer.is_active">
                    <option :value="true">Active</option>
                    <option :value="false">Inactive</option>
                  </select>
                  <div class="form-text">Inactive customers won't appear in POS customer selection</div>
                </div>

                <!-- Address -->
                <div class="col-12">
                  <label for="address" class="form-label">Address</label>
                  <textarea class="form-control" id="address" v-model="customer.address" rows="3"
                    :class="{ 'is-invalid': errors.address }"></textarea>
                  <div class="invalid-feedback">{{ errors.address }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Customer History (for edit mode) -->
          <div v-if="isEditMode && salesHistory.length > 0" class="card mt-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Purchase History</h5>
            </div>
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sale in salesHistory" :key="sale.id">
                    <td>{{ sale.invoice_number }}</td>
                    <td>{{ formatDate(sale.created_at) }}</td>
                    <td>
                      <span class="badge bg-info">{{ sale.sale_items?.length || 0 }}</span>
                    </td>
                    <td>{{ formatCurrency(sale.total_amount) }}</td>
                    <td>
                      <span class="badge" :class="{
                        'bg-success': sale.status === 'completed',
                        'bg-warning text-dark': sale.status === 'pending',
                        'bg-danger': sale.status === 'cancelled'
                      }">
                        {{ sale.status.toUpperCase() }}
                      </span>
                    </td>
                    <td class="text-end">
                      <router-link :to="`/sales/${sale.id}`" class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-eye"></i> View
                      </router-link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="card-footer text-end">
              <router-link :to="`/sales?customer=${customer.id}`" class="btn btn-link">
                View All Purchases <i class="bi bi-arrow-right"></i>
              </router-link>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <!-- Customer Stats (for edit mode) -->
          <div v-if="isEditMode" class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Customer Stats</h5>
            </div>
            <div class="card-body">
              <div class="customer-stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span class="stat-label">Total Purchases</span>
                  <span class="stat-value">{{ customerStats.total_purchases || 0 }}</span>
                </div>
                <div class="progress mt-1">
                  <div class="progress-bar bg-primary" role="progressbar"
                    :style="`width: ${calculateProgressPercentage(customerStats.total_purchases, 20)}%`"
                    aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>

              <div class="customer-stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span class="stat-label">Lifetime Value</span>
                  <span class="stat-value">{{ formatCurrency(customerStats.lifetime_value || 0) }}</span>
                </div>
              </div>

              <div class="customer-stat-item mb-3">
                <div class="d-flex justify-content-between">
                  <span class="stat-label">Last Purchase</span>
                  <span class="stat-value">{{ customerStats.last_purchase ? formatDate(customerStats.last_purchase) :
                    'Never' }}</span>
                </div>
              </div>

              <div class="customer-stat-item">
                <div class="d-flex justify-content-between">
                  <span class="stat-label">Customer Since</span>
                  <span class="stat-value">{{ formatDate(customer.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Card -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"
                    aria-hidden="true"></span>
                  {{ isEditMode ? 'Update Customer' : 'Create Customer' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="$router.push('/customers')">
                  Cancel
                </button>
                <button v-if="isEditMode && authStore.hasPermission('sale-create')" type="button"
                  class="btn btn-outline-success" @click="createNewSale">
                  <i class="bi bi-cart-plus me-1"></i> Create New Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import { useAuthStore } from '../../stores/auth';

// Router and store
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const customer = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  is_active: true,
});
const salesHistory = ref([]);
const customerStats = ref({
  total_purchases: 0,
  lifetime_value: 0,
  last_purchase: null,
});
const loading = ref(true);
const submitting = ref(false);
const errors = ref({});
const error = ref(null);

// Computed
const isEditMode = computed(() => !!route.params.id);
const customerId = computed(() => route.params.id);

// Lifecycle hooks
onMounted(async () => {
  // Check permissions
  if ((isEditMode.value && !authStore.hasPermission('customer-edit')) ||
    (!isEditMode.value && !authStore.hasPermission('customer-create'))) {
    error.value = 'You do not have permission to perform this action';
    loading.value = false;
    return;
  }

  if (isEditMode.value) {
    try {
      loading.value = true;

      // Fetch customer data
      const customerResponse = await api.get(`/customers/${customerId.value}`);
      const customerData = customerResponse.data.data;

      // Update customer state
      customer.value = {
        name: customerData.name,
        email: customerData.email || '',
        phone: customerData.phone || '',
        address: customerData.address || '',
        is_active: customerData.is_active,
        created_at: customerData.created_at,
      };

      // Fetch customer sales history (last 5 sales)
      try {
        const salesResponse = await api.get(`/customers/${customerId.value}/sales?limit=5`);
        salesHistory.value = salesResponse.data.data || [];

        // Calculate customer stats
        if (salesHistory.value.length > 0) {
          // Total purchases
          customerStats.value.total_purchases = salesHistory.value.length;

          // Lifetime value
          customerStats.value.lifetime_value = salesHistory.value.reduce((total, sale) => {
            return total + (sale.status === 'completed' ? parseFloat(sale.total_amount) : 0);
          }, 0);

          // Last purchase
          const latestSale = salesHistory.value.reduce((latest, sale) => {
            if (!latest || new Date(sale.created_at) > new Date(latest.created_at)) {
              return sale;
            }
            return latest;
          }, null);

          if (latestSale) {
            customerStats.value.last_purchase = latestSale.created_at;
          }
        }
      } catch (err) {
        console.warn('Error fetching sales history:', err);
        // Not critical, so continue without sales history
      }

      error.value = null;
    } catch (err) {
      console.error('Error loading customer:', err);
      error.value = 'Failed to load customer data. Please try again.';
    } finally {
      loading.value = false;
    }
  } else {
    // For new customer, just set loading to false
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

// Calculate progress percentage for progress bars
const calculateProgressPercentage = (value, max) => {
  if (!value) return 0;
  return Math.min(Math.round((value / max) * 100), 100);
};

// Create new sale for this customer
const createNewSale = () => {
  router.push(`/pos?customer=${customerId.value}`);
};

// Form validation
const validateForm = () => {
  const newErrors = {};

  // Validate name
  if (!customer.value.name.trim()) {
    newErrors.name = 'Customer name is required';
  }

  // Validate email if provided
  if (customer.value.email && !isValidEmail(customer.value.email)) {
    newErrors.email = 'Please enter a valid email address';
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

// Email validation
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Submit form
const handleSubmit = async () => {
  if (!validateForm()) return;

  submitting.value = true;

  try {
    const customerData = {
      name: customer.value.name,
      email: customer.value.email,
      phone: customer.value.phone,
      address: customer.value.address,
      is_active: customer.value.is_active
    };

    let response;
    if (isEditMode.value) {
      response = await api.put(`/customers/${customerId.value}`, customerData);
    } else {
      response = await api.post('/customers', customerData);
    }

    // Show success message
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: isEditMode.value ? 'Customer Updated' : 'Customer Created',
      text: isEditMode.value
        ? `${customer.value.name} has been updated successfully`
        : `${customer.value.name} has been added as a new customer`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    }).then(() => {
      // Redirect to customers list
      router.push('/customers');
    });
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
    } else {
      // Show error message
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'An error occurred while saving the customer',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.customer-stat-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.customer-stat-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.stat-label {
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
}
</style>