<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="mb-1">Sale Detail</h1>
        <h5 v-if="sale" class="text-muted">Invoice #{{ sale.invoice_number }}</h5>
      </div>
      <div class="d-flex">
        <router-link to="/sales" class="btn btn-outline-secondary me-2">
          <i class="bi bi-arrow-left me-1"></i> Back to Sales
        </router-link>
        <button 
          v-if="sale && sale.status !== 'cancelled'" 
          class="btn btn-primary me-2"
          @click="printInvoice"
        >
          <i class="bi bi-printer me-1"></i> Print Invoice
        </button>
        <button 
          v-if="sale && sale.status === 'completed' && authStore.hasPermission('sale-edit')" 
          class="btn btn-danger"
          @click="confirmCancelSale"
        >
          <i class="bi bi-x-circle me-1"></i> Cancel Sale
        </button>
      </div>
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

    <!-- Sale details -->
    <div v-else-if="sale" class="sale-details">
      <!-- Sale information -->
      <div class="row mb-4">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Sale Information</h5>
              <span 
                class="badge"
                :class="{
                  'bg-success': sale.status === 'completed',
                  'bg-warning text-dark': sale.status === 'pending',
                  'bg-danger': sale.status === 'cancelled'
                }"
              >
                {{ sale.status.toUpperCase() }}
              </span>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <table class="table table-borderless table-sm">
                    <tbody>
                      <tr>
                        <td class="fw-bold">Invoice #:</td>
                        <td>{{ sale.invoice_number }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Date:</td>
                        <td>{{ formatDateTime(sale.created_at) }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Cashier:</td>
                        <td>{{ sale.user?.name || 'Unknown' }}</td>
                      </tr>
                      <tr>
                        <td class="fw-bold">Payment Method:</td>
                        <td class="text-capitalize">{{ sale.payment_method }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <table class="table table-borderless table-sm">
                    <tbody>
                      <tr>
                        <td class="fw-bold">Customer:</td>
                        <td>{{ sale.customer?.name || 'Walk-in Customer' }}</td>
                      </tr>
                      <tr v-if="sale.customer?.email">
                        <td class="fw-bold">Email:</td>
                        <td>{{ sale.customer.email }}</td>
                      </tr>
                      <tr v-if="sale.customer?.phone">
                        <td class="fw-bold">Phone:</td>
                        <td>{{ sale.customer.phone }}</td>
                      </tr>
                      <tr v-if="sale.notes">
                        <td class="fw-bold">Notes:</td>
                        <td>{{ sale.notes }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Payment Summary</h5>
            </div>
            <div class="card-body">
              <table class="table table-sm">
                <tbody>
                  <tr>
                    <td>Subtotal:</td>
                    <td class="text-end">{{ formatCurrency(calculateSubtotal()) }}</td>
                  </tr>
                  <tr v-if="sale.discount > 0">
                    <td>Discount:</td>
                    <td class="text-end text-danger">-{{ formatCurrency(sale.discount) }}</td>
                  </tr>
                  <tr v-if="sale.tax > 0">
                    <td>Tax:</td>
                    <td class="text-end">{{ formatCurrency(sale.tax) }}</td>
                  </tr>
                  <tr class="fw-bold">
                    <td>Total:</td>
                    <td class="text-end">{{ formatCurrency(sale.total_amount) }}</td>
                  </tr>
                  <tr>
                    <td>Paid Amount:</td>
                    <td class="text-end">{{ formatCurrency(sale.paid_amount) }}</td>
                  </tr>
                  <tr v-if="sale.change > 0">
                    <td>Change:</td>
                    <td class="text-end">{{ formatCurrency(sale.change) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Sale items -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="card-title mb-0">Items Purchased</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Discount</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in sale.sale_items" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>
                  {{ item.product?.name || 'Unknown Product' }}
                  <small v-if="item.product?.code" class="text-muted d-block">
                    {{ item.product.code }}
                  </small>
                </td>
                <td>{{ formatCurrency(item.price) }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.discount > 0 ? formatCurrency(item.discount) : '-' }}</td>
                <td class="text-end">{{ formatCurrency(item.subtotal) }}</td>
              </tr>
              <tr v-if="!sale.sale_items || sale.sale_items.length === 0">
                <td colspan="6" class="text-center">No items found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Sale not found -->
    <div v-else class="text-center py-5">
      <i class="bi bi-exclamation-circle display-1 text-muted"></i>
      <p class="lead mt-3">Sale not found</p>
      <router-link to="/sales" class="btn btn-primary mt-2">
        View All Sales
      </router-link>
    </div>

    <!-- Print Invoice Modal (hidden) -->
    <div ref="invoiceContainer" class="d-none">
      <div id="invoice-print" class="invoice-print">
        <div class="invoice-header text-center mb-4">
          <h2>{{ companyName }}</h2>
          <p v-if="companyAddress">{{ companyAddress }}</p>
          <p v-if="companyPhone">Phone: {{ companyPhone }}</p>
          <p v-if="companyEmail">Email: {{ companyEmail }}</p>
          <h3 class="mt-3">SALES RECEIPT</h3>
        </div>

        <div class="invoice-info mb-4">
          <div class="row">
            <div class="col-6">
              <p><strong>Invoice #:</strong> {{ sale?.invoice_number }}</p>
              <p><strong>Date:</strong> {{ formatDateTime(sale?.created_at) }}</p>
              <p><strong>Cashier:</strong> {{ sale?.user?.name || 'Unknown' }}</p>
            </div>
            <div class="col-6 text-end">
              <p><strong>Customer:</strong> {{ sale?.customer?.name || 'Walk-in Customer' }}</p>
              <p v-if="sale?.customer?.phone"><strong>Phone:</strong> {{ sale.customer.phone }}</p>
            </div>
          </div>
        </div>

        <table class="invoice-items mb-4">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Qty</th>
              <th class="text-end">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sale?.sale_items" :key="item.id">
              <td>{{ item.product?.name || 'Unknown Product' }}</td>
              <td>{{ formatCurrency(item.price) }}</td>
              <td>{{ item.quantity }}</td>
              <td class="text-end">{{ formatCurrency(item.subtotal) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="invoice-summary">
          <div class="row">
            <div class="col-7">
              <p v-if="sale?.notes"><strong>Notes:</strong> {{ sale.notes }}</p>
              <p><strong>Payment Method:</strong> {{ sale?.payment_method.toUpperCase() }}</p>
            </div>
            <div class="col-5">
              <table class="summary-table">
                <tr>
                  <td>Subtotal:</td>
                  <td class="text-end">{{ formatCurrency(calculateSubtotal()) }}</td>
                </tr>
                <tr v-if="sale?.discount > 0">
                  <td>Discount:</td>
                  <td class="text-end">-{{ formatCurrency(sale.discount) }}</td>
                </tr>
                <tr v-if="sale?.tax > 0">
                  <td>Tax:</td>
                  <td class="text-end">{{ formatCurrency(sale.tax) }}</td>
                </tr>
                <tr class="total">
                  <td>Total:</td>
                  <td class="text-end">{{ formatCurrency(sale?.total_amount) }}</td>
                </tr>
                <tr>
                  <td>Paid:</td>
                  <td class="text-end">{{ formatCurrency(sale?.paid_amount) }}</td>
                </tr>
                <tr v-if="sale?.change > 0">
                  <td>Change:</td>
                  <td class="text-end">{{ formatCurrency(sale?.change) }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <div class="invoice-footer text-center mt-4">
          <p>Thank you for your business!</p>
          <p class="small">{{ new Date().toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import api from '../../services/api';
import Swal from 'sweetalert2';

// Router and store
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// State
const sale = ref(null);
const loading = ref(true);
const error = ref(null);
const invoiceContainer = ref(null);

// Company info for invoice
const companyName = ref('Simple POS');
const companyAddress = ref('');
const companyPhone = ref('');
const companyEmail = ref('');

// Computed
const saleId = computed(() => route.params.id);

// Lifecycle hooks
onMounted(async () => {
  // Check permission
  if (!authStore.hasPermission('sale-list')) {
    error.value = 'You do not have permission to view sale details';
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    
    // Fetch sale details
    const response = await api.get(`/sales/${saleId.value}`);
    sale.value = response.data.data;
    
    // Fetch company info for invoice
    const settingsResponse = await api.get('/settings');
    const settings = settingsResponse.data.data;
    
    companyName.value = settings.company_name || 'Simple POS';
    companyAddress.value = settings.company_address || '';
    companyPhone.value = settings.company_phone || '';
    companyEmail.value = settings.company_email || '';
    
    error.value = null;
  } catch (err) {
    console.error('Error loading sale details:', err);
    error.value = 'Failed to load sale details. Please try again.';
  } finally {
    loading.value = false;
  }
});

// Format date and time
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
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

// Calculate subtotal (sum of all item subtotals)
const calculateSubtotal = () => {
  if (!sale.value || !sale.value.sale_items || sale.value.sale_items.length === 0) {
    return 0;
  }
  
  return sale.value.sale_items.reduce((total, item) => total + parseFloat(item.subtotal), 0);
};

// Print invoice
const printInvoice = () => {
  const printContents = invoiceContainer.value.innerHTML;
  const originalContents = document.body.innerHTML;
  
  // Add print-specific styles
  const printStyles = `
    <style>
      @media print {
        body {
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.3;
        }
        .invoice-print {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        .invoice-header {
          margin-bottom: 20px;
        }
        .invoice-header h2, .invoice-header h3 {
          margin: 5px 0;
        }
        .invoice-info {
          margin-bottom: 20px;
        }
        .invoice-items {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        .invoice-items th, .invoice-items td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .invoice-items th {
          background-color: #f2f2f2;
        }
        .summary-table {
          width: 100%;
          margin-left: auto;
        }
        .summary-table td {
          padding: 3px 0;
        }
        .total {
          font-weight: bold;
        }
        .invoice-footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10pt;
        }
      }
    </style>
  `;
  
  // Open print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice #${sale.value.invoice_number}</title>
        ${printStyles}
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Print after resources are loaded
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

// Cancel sale
const confirmCancelSale = () => {
  if (sale.value.status !== 'completed') {
    Swal.fire({
      icon: 'warning',
      title: 'Cannot Cancel',
      text: 'Only completed sales can be cancelled',
    });
    return;
  }
  
  Swal.fire({
    title: 'Are you sure?',
    text: `Cancel sale #${sale.value.invoice_number}? This will return all items to inventory.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, cancel it!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.put(`/sales/${sale.value.id}`, {
          status: 'cancelled',
          notes: sale.value.notes ? `${sale.value.notes} (Cancelled)` : 'Cancelled by user'
        });
        
        // Refresh sale data
        const response = await api.get(`/sales/${saleId.value}`);
        sale.value = response.data.data;
        
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
</script>

<style scoped>
/* Hide print styles in normal view */
.invoice-print {
  display: none;
}

/* Override for table inside card */
.table-responsive .table {
  margin-bottom: 0;
}

/* Status badges */
.badge {
  font-size: 0.8rem;
  padding: 0.4rem 0.6rem;
}

@media (max-width: 767.98px) {
  .d-flex {
    flex-direction: column;
  }
  
  .btn {
    margin-top: 0.5rem;
    margin-left: 0 !important;
  }
}
</style>