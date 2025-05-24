<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h1>
      <router-link to="/products" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i> Back to Products
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

    <!-- Product form -->
    <form v-else @submit.prevent="handleSubmit" class="needs-validation" novalidate>
      <div class="card">
        <div class="card-body">
          <div class="row g-3">
            <!-- Basic Information -->
            <div class="col-md-6">
              <label for="name" class="form-label">Product Name <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="product.name"
                required
                :class="{ 'is-invalid': errors.name }"
              />
              <div class="invalid-feedback">{{ errors.name }}</div>
            </div>

            <div class="col-md-6">
              <label for="code" class="form-label">Product Code <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                id="code"
                v-model="product.code"
                required
                :class="{ 'is-invalid': errors.code }"
              />
              <div class="invalid-feedback">{{ errors.code }}</div>
              <div class="form-text" v-if="!isEditMode">Leave empty to generate automatically</div>
            </div>

            <div class="col-md-6">
              <label for="category" class="form-label">Category <span class="text-danger">*</span></label>
              <select
                class="form-select"
                id="category"
                v-model="product.category_id"
                required
                :class="{ 'is-invalid': errors.category_id }"
              >
                <option value="" disabled selected>Select category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <div class="invalid-feedback">{{ errors.category_id }}</div>
            </div>

            <div class="col-md-6">
              <label for="is_active" class="form-label">Status</label>
              <select class="form-select" id="is_active" v-model="product.is_active">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>

            <!-- Pricing Information -->
            <div class="col-md-6">
              <label for="price" class="form-label">Selling Price <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input
                  type="number"
                  class="form-control"
                  id="price"
                  v-model="product.price"
                  min="0"
                  step="0.01"
                  required
                  :class="{ 'is-invalid': errors.price }"
                />
                <div class="invalid-feedback">{{ errors.price }}</div>
              </div>
            </div>

            <div class="col-md-6">
              <label for="cost" class="form-label">Cost Price</label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input
                  type="number"
                  class="form-control"
                  id="cost"
                  v-model="product.cost"
                  min="0"
                  step="0.01"
                />
              </div>
              <div class="form-text">Your purchase cost (optional)</div>
            </div>

            <!-- Stock Information -->
            <div class="col-md-6">
              <label for="stock" class="form-label">Stock Quantity <span class="text-danger">*</span></label>
              <input
                type="number"
                class="form-control"
                id="stock"
                v-model="product.stock"
                min="0"
                required
                :class="{ 'is-invalid': errors.stock }"
              />
              <div class="invalid-feedback">{{ errors.stock }}</div>
            </div>

            <div class="col-md-6">
              <label for="alert_stock" class="form-label">Alert Stock Level</label>
              <input
                type="number"
                class="form-control"
                id="alert_stock"
                v-model="product.alert_stock"
                min="0"
              />
              <div class="form-text">Get alerted when stock falls below this level</div>
            </div>

            <!-- Product Description -->
            <div class="col-12">
              <label for="description" class="form-label">Description</label>
              <textarea
                class="form-control"
                id="description"
                v-model="product.description"
                rows="3"
              ></textarea>
            </div>

            <!-- Product Image -->
            <div class="col-12">
              <label for="image" class="form-label">Product Image</label>
              <div class="d-flex align-items-center">
                <div v-if="product.image || imagePreview" class="me-3 product-image-preview">
                  <img 
                    :src="imagePreview || product.image" 
                    alt="Product Image" 
                    class="img-thumbnail"
                  />
                  <button 
                    type="button" 
                    class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                    @click="removeImage"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
                <div class="flex-grow-1">
                  <input
                    type="file"
                    class="form-control"
                    id="image"
                    @change="handleImageChange"
                    accept="image/*"
                    :class="{ 'is-invalid': errors.image }"
                  />
                  <div class="invalid-feedback">{{ errors.image }}</div>
                  <div class="form-text">Supported formats: JPEG, PNG, GIF (max 2MB)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-outline-secondary me-2" @click="$router.push('/products')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isEditMode ? 'Update Product' : 'Create Product' }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();

// State
const categories = ref([]);
const product = ref({
  name: '',
  code: '',
  description: '',
  price: '',
  cost: '',
  stock: 0,
  alert_stock: 10,
  category_id: '',
  is_active: true,
  image: null
});
const imageFile = ref(null);
const imagePreview = ref(null);
const loading = ref(false);
const submitting = ref(false);
const errors = ref({});
const error = ref(null);

// Computed
const isEditMode = computed(() => !!route.params.id);
const productId = computed(() => route.params.id);

// Lifecycle hooks
onMounted(async () => {
  loading.value = true;
  
  try {
    // Fetch categories
    const categoriesResponse = await api.get('/categories');
    categories.value = categoriesResponse.data.data;
    
    // If edit mode, fetch product details
    if (isEditMode.value) {
      const productResponse = await api.get(`/products/${productId.value}`);
      const productData = productResponse.data.data;
      
      // Update product state
      product.value = {
        name: productData.name,
        code: productData.code,
        description: productData.description || '',
        price: productData.price,
        cost: productData.cost || '',
        stock: productData.stock,
        alert_stock: productData.alert_stock,
        category_id: productData.category_id,
        is_active: productData.is_active,
        image: productData.image
      };
    }
    
    error.value = null;
  } catch (err) {
    console.error('Error loading data:', err);
    error.value = 'Failed to load data. Please try again.';
  } finally {
    loading.value = false;
  }
});

// Methods
const handleImageChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.value.image = 'Please upload a valid image (JPEG, PNG, GIF)';
    return;
  }
  
  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    errors.value.image = 'Image size should not exceed 2MB';
    return;
  }
  
  // Clear previous error
  errors.value.image = null;
  
  // Set image file for upload
  imageFile.value = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
  product.value.image = null;
  
  // Reset file input
  const fileInput = document.getElementById('image');
  if (fileInput) fileInput.value = '';
};

const validateForm = () => {
  const newErrors = {};
  
  // Required fields
  if (!product.value.name) newErrors.name = 'Product name is required';
  if (!product.value.code && isEditMode.value) newErrors.code = 'Product code is required';
  if (!product.value.category_id) newErrors.category_id = 'Category is required';
  if (!product.value.price) newErrors.price = 'Selling price is required';
  if (product.value.price <= 0) newErrors.price = 'Selling price must be greater than zero';
  if (product.value.stock < 0) newErrors.stock = 'Stock cannot be negative';
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};


const handleSubmit = async () => {
  // Jalankan validasi form
  const isValid = validateForm();
  if (!isValid) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: 'Please fill all required fields',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
    return;
  }

  submitting.value = true;

  try {
    const formData = new FormData();
    formData.append('name', product.value.name || '');
    formData.append('code', product.value.code || '');
    formData.append('description', product.value.description || '');
    formData.append('price', product.value.price || 0);
    formData.append('cost', product.value.cost || 0);
    formData.append('stock', product.value.stock || 0);
    formData.append('alert_stock', product.value.alert_stock || 0);
    formData.append('category_id', product.value.category_id || '');
    formData.append('is_active', product.value.is_active ? 1 : 0);

    if (imageFile.value) {
      formData.append('image', imageFile.value);
    }

    let response;
    if (isEditMode.value) {
      formData.append('_method', 'PUT');
      response = await api.post(`/products/${productId.value}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    // Toast success
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: isEditMode.value ? 'Product Updated' : 'Product Created',
      text: isEditMode.value 
        ? `${product.value.name} has been updated successfully` 
        : `${product.value.name} has been added successfully`,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    // Redirect setelah delay
    setTimeout(() => {
      router.push('/products');
    }, 1000);

  } catch (err) {
    console.error('Error submitting form:', err);

    if (err.response?.status === 422 && err.response?.data?.errors) {
      const validationErrors = err.response.data.errors;
      const newErrors = {};

      Object.keys(validationErrors).forEach(key => {
        newErrors[key] = validationErrors[key][0];
      });

      errors.value = newErrors;

      // Tampilkan error pertama dengan toast
      const firstError = Object.values(newErrors)[0];
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Validation Error',
        text: firstError,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });

    } else {
      // Error umum
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'An error occurred while saving the product',
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
.product-image-preview {
  position: relative;
  width: 100px;
  height: 100px;
}

.product-image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>