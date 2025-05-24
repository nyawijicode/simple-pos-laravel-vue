<template>
  <div class="register-container">
    <div class="card register-card">
      <div class="card-body">
        <h2 class="text-center mb-4">Simple POS</h2>
        <h4 class="text-center mb-4">Register</h4>
        <form @submit.prevent="handleRegister">
          <div class="alert alert-danger" v-if="error">
            {{ error }}
          </div>

          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input
              type="text"
              class="form-control"
              id="name"
              v-model="name"
              required
              autofocus
            />
          </div>

          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="email"
              required
            />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="password"
              required
            />
          </div>

          <div class="mb-3">
            <label for="password_confirmation" class="form-label">Confirm Password</label>
            <input
              type="password"
              class="form-control"
              id="password_confirmation"
              v-model="password_confirmation"
              required
            />
          </div>

          <div class="mb-3">
            <label for="phone" class="form-label">Phone (optional)</label>
            <input
              type="text"
              class="form-control"
              id="phone"
              v-model="phone"
            />
          </div>

          <div class="mb-3">
            <label for="address" class="form-label">Address (optional)</label>
            <textarea
              class="form-control"
              id="address"
              v-model="address"
              rows="2"
            ></textarea>
          </div>

          <div class="d-grid mb-3">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Register
            </button>
          </div>

          <div class="text-center">
            <router-link to="/login">Already have an account? Login</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const password_confirmation = ref('');
const phone = ref('');
const address = ref('');
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  if (password.value !== password_confirmation.value) {
    error.value = 'Passwords do not match';
    loading.value = false;
    return;
  }

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
      phone: phone.value,
      address: address.value,
    });

    router.push('/dashboard');
  } catch (err) {
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      const firstError = Object.values(errors)[0][0];
      error.value = firstError || 'Registration failed. Please try again.';
    } else {
      error.value = err.response?.data?.message || 'Registration failed. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 0;
}

.register-card {
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>