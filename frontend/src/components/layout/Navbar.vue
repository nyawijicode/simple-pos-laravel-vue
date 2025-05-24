<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">Simple POS</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
          </li>
          <li class="nav-item" v-if="authStore.hasPermission('product-list')">
            <router-link class="nav-link" to="/products">Products</router-link>
          </li>
          <li class="nav-item" v-if="authStore.hasPermission('category-list')">
            <router-link class="nav-link" to="/categories">Categories</router-link>
          </li>
          <li class="nav-item" v-if="authStore.hasPermission('customer-list')">
            <router-link class="nav-link" to="/customers">Customers</router-link>
          </li>
          <li class="nav-item" v-if="authStore.hasPermission('sale-list')">
            <router-link class="nav-link" to="/sales">Sales</router-link>
          </li>
          <li class="nav-item" v-if="authStore.hasPermission('sale-create')">
            <router-link class="nav-link" to="/pos">POS</router-link>
          </li>
          <li class="nav-item" v-if="authStore.hasPermission('user-list')">
            <router-link class="nav-link" to="/users">Users</router-link>
          </li>
          <li class="nav-item" v-if="authStore.hasPermission('setting-edit')">
            <router-link class="nav-link" to="/settings">Settings</router-link>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              {{ authStore.user?.name }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li><router-link class="dropdown-item" to="/profile">Profile</router-link></li>
              <li>
                <hr class="dropdown-divider">
              </li>
              <li><a class="dropdown-item" href="#" @click.prevent="logout">Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth';
import { onMounted } from 'vue';

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchUser();
  }
});

const logout = () => {
  authStore.logout();
};
</script>