artifacttitle: "Category Form Component"
type: "application/vnd.ant.code"
language: "vue"
id: "category-form-component"
vue<!-- src/components/categories/CategoryForm.vue -->
<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ isEditMode ? 'Edit Category' : 'Add New Category' }}</h1>
      <router-link to="/categories" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i> Back to Categories
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

    <!-- Category form -->
    <form v-else @submit.prevent="handleSubmit" class="needs-validation" novalidate>
      <div class="card">
        <div class="card-body">
          <div class="row g-3">
            <!-- Category Name -->
            <div class="col-md-12">
              <label for="name" class="form-label">Category Name <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="name" v-model="category.name" required
                :class="{ 'is-invalid': errors.name }" autofocus />
              <div class="invalid-feedback">{{ errors.name }}</div>
              <div class="form-text" v-if="category.slug">
                Slug: {{ category.slug }}
              </div>
            </div>

            <!-- Description -->
            <div class="col-md-12">
              <label for="description" class="form-label">Description</label>
              <textarea class="form-control" id="description" v-model="category.description" rows="3"
                :class="{ 'is-invalid': errors.description }"></textarea>
              <div class="invalid-feedback">{{ errors.description }}</div>
              <div class="form-text">
                Provide a brief description of what this category represents (optional)
              </div>
            </div>

            <!-- Status -->
            <div class="col-md-6">
              <label for="is_active" class="form-label">Status</label>
              <select class="form-select" id="is_active" v-model="category.is_active"
                :class="{ 'is-invalid': errors.is_active }">
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
              <div class="invalid-feedback">{{ errors.is_active }}</div>
              <div class="form-text">
                Inactive categories won't be shown in the product selection
              </div>
            </div>

            <!-- Products Count (only in edit mode) -->
            <div class="col-md-6" v-if="isEditMode && category.products_count !== undefined">
              <label class="form-label">Products in this Category</label>
              <div class="input-group">
                <input type="text" class="form-control" :value="category.products_count || 0" disabled />
                <router-link to="/products" class="btn btn-outline-primary"
                  :class="{ disabled: !category.products_count }">
                  View Products
                </router-link>
              </div>
            </div>
          </div>

          <!-- Advanced Section (if needed in the future) -->
          <div v-if="showAdvanced" class="mt-4 pt-3 border-top">
            <h5>Advanced Settings</h5>
            <div class="row g-3">
              <!-- Placeholder for future advanced settings -->
              <div class="col-md-12">
                <p class="text-muted">No advanced settings available for categories at this time.</p>
              </div>
            </div>
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <button type="button" class="btn btn-outline-secondary" @click="toggleAdvanced">
            {{ showAdvanced ? 'Hide Advanced' : 'Show Advanced' }}
          </button>
          <div>
            <button type="button" class="btn btn-outline-secondary me-2" @click="$router.push('/categories')">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2" role="status"
                aria-hidden="true"></span>
              {{ isEditMode ? 'Update Category' : 'Create Category' }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import Swal from 'sweetalert2';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';

const route = useRoute();
const router = useRouter();

// State
const category = ref({
  name: '',
  description: '',
  is_active: true,
  slug: '',
  products_count: 0
});
const loading = ref(false);
const submitting = ref(false);
const errors = ref({});
const error = ref(null);
const showAdvanced = ref(false);

// Computed
const isEditMode = computed(() => !!route.params.id);
const categoryId = computed(() => route.params.id);

// Generate slug from name (for preview only, actual slug is generated on the server)
watch(() => category.value.name, (newName) => {
  if (newName) {
    category.value.slug = newName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special characters
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-');      // Replace multiple hyphens with a single one
  } else {
    category.value.slug = '';
  }
});

// Lifecycle hooks
onMounted(async () => {
  if (isEditMode.value) {
    loading.value = true;

    try {
      const response = await api.get(`/categories/${categoryId.value}`);
      const categoryData = response.data.data;

      // Update category state
      category.value = {
        name: categoryData.name,
        description: categoryData.description || '',
        is_active: categoryData.is_active,
        slug: categoryData.slug,
        products_count: categoryData.products_count
      };

      error.value = null;
    } catch (err) {
      console.error('Error loading category:', err);
      error.value = 'Failed to load category. Please try again.';
    } finally {
      loading.value = false;
    }
  }
});

// Methods
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value;
};

const validateForm = () => {
  const newErrors = {};

  // Validate name
  if (!category.value.name.trim()) {
    newErrors.name = 'Category name is required';
  } else if (category.value.name.length > 255) {
    newErrors.name = 'Category name must be less than 255 characters';
  }

  // Validate description (optional)
  if (category.value.description && category.value.description.length > 1000) {
    newErrors.description = 'Description must be less than 1000 characters';
  }

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  submitting.value = true;

  try {
    const categoryData = {
      name: category.value.name,
      description: category.value.description,
      is_active: category.value.is_active
    };

    let response;
    if (isEditMode.value) {
      response = await api.put(`/categories/${categoryId.value}`, categoryData);
    } else {
      response = await api.post('/categories', categoryData);
    }

    // Show success message
    Swal.fire({
      icon: 'success',
      title: isEditMode.value ? 'Category Updated' : 'Category Created',
      text: isEditMode.value
        ? `${category.value.name} has been updated successfully`
        : `${category.value.name} has been added to your categories`,
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

    // Redirect ke halaman categories setelah notifikasi muncul
    setTimeout(() => {
      router.push('/categories');
    }, 3100); // beri delay sedikit supaya user bisa lihat toast

  } catch (err) {
    console.error('Error submitting form:', err);

    // Handle validasi error
    if (err.response?.status === 422 && err.response?.data?.errors) {
      const validationErrors = err.response.data.errors;
      const newErrors = {};

      Object.keys(validationErrors).forEach(key => {
        newErrors[key] = validationErrors[key][0];
      });

      errors.value = newErrors;
    } else {
      // Notifikasi error sebagai toast di atas kanan
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'An error occurred while saving the category',
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
/* Add any category form specific styling here */
</style>