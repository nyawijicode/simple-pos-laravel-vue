<template>
  <MainLayout v-if="authStore.isAuthenticated">
    <router-view />
  </MainLayout>
  <router-view v-else />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import MainLayout from './components/layout/MainLayout.vue';

const authStore = useAuthStore();

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchUser();
  }
});
</script>

<style>
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
}
</style>