<template>
  <div class="sidebar bg-light">
    <div class="d-flex flex-column p-3" style="height: 100vh;">
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard') }" to="/dashboard">
            <i class="bi bi-speedometer2 me-2"></i>
            Dashboard
          </router-link>
        </li>
        <li v-if="authStore.hasPermission('sale-create')">
          <router-link class="nav-link" :class="{ active: isActive('/pos') }" to="/pos">
            <i class="bi bi-cart-check me-2"></i>
            POS
          </router-link>
        </li>
        <li v-if="authStore.hasPermission('product-list')">
          <router-link class="nav-link" :class="{ active: isActive('/products') }" to="/products">
            <i class="bi bi-box me-2"></i>
            Products
          </router-link>
        </li>
        <li v-if="authStore.hasPermission('category-list')">
          <router-link class="nav-link" :class="{ active: isActive('/categories') }" to="/categories">
            <i class="bi bi-tag me-2"></i>
            Categories
          </router-link>
        </li>
        <li v-if="authStore.hasPermission('customer-list')">
          <router-link class="nav-link" :class="{ active: isActive('/customers') }" to="/customers">
            <i class="bi bi-people me-2"></i>
            Customers
          </router-link>
        </li>
        <li v-if="authStore.hasPermission('sale-list')">
          <router-link class="nav-link" :class="{ active: isActive('/sales') }" to="/sales">
            <i class="bi bi-receipt me-2"></i>
            Sales
          </router-link>
        </li>
        <li v-if="authStore.hasPermission('user-list')">
          <router-link class="nav-link" :class="{ active: isActive('/users') }" to="/users">
            <i class="bi bi-person-badge me-2"></i>
            Users
          </router-link>
        </li>
        <li v-if="authStore.hasPermission('setting-edit')">
          <router-link class="nav-link" :class="{ active: isActive('/settings') }" to="/settings">
            <i class="bi bi-gear me-2"></i>
            Settings
          </router-link>
        </li>
      </ul>
      <hr>
      <div class="dropdown">
        <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle" id="dropdownUser1"
          data-bs-toggle="dropdown" aria-expanded="false">
          <img :src="userAvatar" alt="" width="32" height="32" class="rounded-circle me-2">
          <strong>{{ authStore.user?.name }}</strong>
        </a>
        <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
          <li><router-link class="dropdown-item" to="/profile">Profile</router-link></li>
          <li>
            <hr class="dropdown-divider">
          </li>
          <li><a class="dropdown-item" href="#" @click.prevent="logout">Sign out</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();

const userAvatar = computed(() => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(authStore.user?.name || 'User')}&background=random`;
});

const isActive = (path) => {
  return route.path.startsWith(path);
};

const logout = () => {
  authStore.logout();
};
</script>

<style scoped>
.sidebar {
  width: 280px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
}

.nav-link {
  color: #333;
}

.nav-link.active {
  background-color: #0d6efd;
  color: #fff;
}
</style>