<template>
  <div class="pos-container">
    <div class="row g-0">
      <!-- Products Section (Left) -->
      <div class="col-md-8 pe-md-2">
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="mb-0">Products</h4>
              <div class="d-flex">
                <div class="input-group me-2">
                  <input type="text" class="form-control" placeholder="Search products..." v-model="searchQuery"
                    @input="searchProducts" />
                  <button class="btn btn-outline-secondary" type="button" @click="searchProducts">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
                <select class="form-select" v-model="selectedCategory" @change="filterProducts">
                  <option value="">All Categories</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
              <p>No products found</p>
            </div>

            <div v-else class="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
              <div v-for="product in filteredProducts" :key="product.id" class="col">
                <div class="card h-100 product-card" :class="{ 'out-of-stock': product.stock <= 0 }"
                  @click="addToCart(product)">
                  <div v-if="product.image" class="product-image">
                    <img :src="product.image" class="card-img-top" :alt="product.name" />
                  </div>
                  <div v-else class="product-image no-image">
                    <i class="bi bi-box"></i>
                  </div>
                  <div class="card-body">
                    <h6 class="card-title mb-1">{{ product.name }}</h6>
                    <p class="card-text mb-1">{{ $formatCurrency(product.price) }}</p>
                    <p class="card-text stock-text">
                      <small>Stock: {{ product.stock }}</small>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Section (Right) -->
      <div class="col-md-4">
        <div class="card sticky-top cart-card">
          <div class="card-header">
            <h4 class="mb-0">Cart</h4>
          </div>
          <div class="card-body p-0">
            <div class="cart-items">
              <div v-if="cart.length === 0" class="text-center py-5">
                <p>No items in cart</p>
              </div>
              <div v-else>
                <div v-for="(item, index) in cart" :key="index" class="cart-item">
                  <div class="cart-item-details">
                    <h6 class="mb-0">{{ item.name }}</h6>
                    <p class="mb-0">{{ $formatCurrency(item.price) }} x {{ item.quantity }}</p>
                  </div>
                  <div class="cart-item-actions">
                    <div class="quantity-control">
                      <button class="btn btn-sm btn-outline-secondary" @click="decreaseQuantity(index)">
                        <i class="bi bi-dash"></i>
                      </button>
                      <span class="mx-2">{{ item.quantity }}</span>
                      <button class="btn btn-sm btn-outline-secondary" @click="increaseQuantity(index, item)">
                        <i class="bi bi-plus"></i>
                      </button>
                    </div>
                    <div class="ms-2">
                      <button class="btn btn-sm btn-danger" @click="removeFromCart(index)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="cart-summary">
              <div class="d-flex justify-content-between py-2 border-top">
                <span>Subtotal:</span>
                <span>{{ $formatCurrency(calculateSubtotal()) }}</span>
              </div>
              <div class="d-flex justify-content-between py-2">
                <span>Discount:</span>
                <div class="d-flex align-items-center">
                  <input type="number" class="form-control form-control-sm text-end discount-input"
                    v-model.number="discount" min="0" />
                </div>
              </div>
              <div class="d-flex justify-content-between py-2">
                <span>Tax ({{ taxRate }}%):</span>
                <span>{{ $formatCurrency(calculateTax()) }}</span>
              </div>
              <div class="d-flex justify-content-between py-2 border-top">
                <span class="fw-bold">Total:</span>
                <span class="fw-bold">{{ $formatCurrency(calculateTotal()) }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <div class="mb-3">
              <label class="form-label">Customer</label>
              <select class="form-select" v-model="customerId">
                <option :value="null">Walk-in Customer</option>
                <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                  {{ customer.name }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Payment Method</label>
              <select class="form-select" v-model="paymentMethod">
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Amount Paid</label>
              <input type="number" class="form-control" v-model.number="paidAmount" min="0" />
              <div v-if="paidAmount > 0" class="form-text">
                Change: {{ $formatCurrency(calculateChange()) }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Notes</label>
              <textarea class="form-control" v-model="notes" rows="2"></textarea>
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-primary" @click="checkout" :disabled="cart.length === 0 || processing">
                <span v-if="processing" class="spinner-border spinner-border-sm me-2" role="status"
                  aria-hidden="true"></span>
                Checkout
              </button>
              <button class="btn btn-outline-secondary" @click="clearCart" :disabled="cart.length === 0">
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';

const router = useRouter();

// Data
const products = ref([]);
const filteredProducts = ref([]);
const categories = ref([]);
const customers = ref([]);
const cart = ref([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const customerId = ref(null);
const paymentMethod = ref('cash');
const paidAmount = ref(0);
const discount = ref(0);
const taxRate = ref(0);
const notes = ref('');
const loading = ref(true);
const processing = ref(false);

// Fetch initial data
onMounted(async () => {
  try {
    // Fetch settings
    const settingsResponse = await api.get('/settings');
    taxRate.value = settingsResponse.data.data.tax_rate || 0;

    // Fetch products, categories, and customers in parallel
    const [productsResponse, categoriesResponse, customersResponse] = await Promise.all([
      api.get('/products'),
      api.get('/categories'),
      api.get('/customers'),
    ]);

    products.value = productsResponse.data.data;
    filteredProducts.value = [...products.value];
    categories.value = categoriesResponse.data.data;
    customers.value = customersResponse.data.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to load data',
    });
  } finally {
    loading.value = false;
  }
});

// Methods
const searchProducts = () => {
  if (!searchQuery.value) {
    filterProducts();
    return;
  }

  const query = searchQuery.value.toLowerCase();
  filteredProducts.value = products.value.filter(product => {
    return (
      product.name.toLowerCase().includes(query) ||
      product.code.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
  });

  // Apply category filter if set
  if (selectedCategory.value) {
    filteredProducts.value = filteredProducts.value.filter(
      product => product.category_id === parseInt(selectedCategory.value)
    );
  }
};

const filterProducts = () => {
  if (selectedCategory.value) {
    filteredProducts.value = products.value.filter(
      product => product.category_id === parseInt(selectedCategory.value)
    );
  } else {
    filteredProducts.value = [...products.value];
  }

  // Apply search query if set
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filteredProducts.value = filteredProducts.value.filter(product => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.code.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query))
      );
    });
  }
};

const addToCart = (product) => {
  if (product.stock <= 0) {
    Swal.fire({
      icon: 'error',
      title: 'Out of Stock',
      text: `${product.name} is out of stock`,
    });
    return;
  }

  const existingItem = cart.value.find(item => item.id === product.id);

  if (existingItem) {
    if (existingItem.quantity < product.stock) {
      existingItem.quantity += 1;
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Stock Limit Reached',
        text: `Only ${product.stock} items available in stock`,
      });
    }
  } else {
    cart.value.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      stock: product.stock,
    });
  }
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

const increaseQuantity = (index, item) => {
  if (item.quantity < item.stock) {
    cart.value[index].quantity += 1;
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Stock Limit Reached',
      text: `Only ${item.stock} items available in stock`,
    });
  }
};

const decreaseQuantity = (index) => {
  if (cart.value[index].quantity > 1) {
    cart.value[index].quantity -= 1;
  } else {
    removeFromCart(index);
  }
};

const clearCart = () => {
  cart.value = [];
  customerId.value = null;
  paymentMethod.value = 'cash';
  paidAmount.value = 0;
  discount.value = 0;
  notes.value = '';
};

const calculateSubtotal = () => {
  return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const calculateTax = () => {
  return ((calculateSubtotal() - discount.value) * taxRate.value) / 100;
};

const calculateTotal = () => {
  return calculateSubtotal() - discount.value + calculateTax();
};

const calculateChange = () => {
  const change = paidAmount.value - calculateTotal();
  return change > 0 ? change : 0;
};

const checkout = async () => {
  if (cart.value.length === 0) {
    Swal.fire({
      icon: 'error',
      title: 'Empty Cart',
      text: 'Please add items to cart',
    });
    return;
  }

  const total = calculateTotal();

  if (paidAmount.value < total) {
    Swal.fire({
      icon: 'error',
      title: 'Insufficient Payment',
      text: `The paid amount must be at least ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(total)}`,
    });
    return;
  }

  processing.value = true;

  try {
    const saleData = {
      customer_id: customerId.value,
      items: cart.value.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      discount: discount.value,
      paid_amount: paidAmount.value,
      payment_method: paymentMethod.value,
      notes: notes.value,
    };

    const response = await api.post('/sales', saleData);

    // Tampilkan notifikasi toast sukses di atas
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Sale Completed',
      text: `Invoice: ${response.data.data.invoice_number}`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    // Bersihkan keranjang
    clearCart();

    // Refresh data produk
    const productsResponse = await api.get('/products');
    products.value = productsResponse.data.data;
    filteredProducts.value = [...products.value];

    // Redirect ke halaman sales
    setTimeout(() => {
      router.push('/sales');
    }, 1000);

  } catch (error) {
    console.error('Error creating sale:', error);

    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'Error',
      text: error.response?.data?.message || 'Failed to complete sale',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

  } finally {
    processing.value = false;
  }
};
</script>

<style scoped>
.pos-container {
  padding: 0 0 1rem 0;
}

.cart-card {
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
}

.cart-items {
  overflow-y: auto;
  max-height: 40vh;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}

.cart-summary {
  padding: 0.75rem 1rem;
}

.product-card {
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  background-color: #f8f9fa;
}

.no-image {
  color: #aaa;
  font-size: 2rem;
}

.product-image img {
  max-height: 100%;
  object-fit: contain;
}

.out-of-stock {
  opacity: 0.6;
  pointer-events: none;
}

.out-of-stock .stock-text {
  color: #dc3545;
}

.discount-input {
  width: 100px;
}

.quantity-control {
  display: flex;
  align-items: center;
}
</style>