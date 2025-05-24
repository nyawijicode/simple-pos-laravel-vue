<template>
  <div class="d-flex">
    <Sidebar v-if="authStore.isAuthenticated" />
    <div class="content" :class="{ 'with-sidebar': authStore.isAuthenticated }">
      <Navbar v-if="authStore.isAuthenticated" />
      <div class="container-fluid p-4">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from './Navbar.vue';
import Sidebar from './Sidebar.vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.content {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.content.with-sidebar {
  margin-left: 280px;
  width: calc(100% - 280px);
}
</style>