<template>
  <div class="not-found-container">
    <div class="not-found-content text-center">
      <div class="error-code">404</div>
      
      <i class="bi bi-exclamation-triangle-fill not-found-icon"></i>
      
      <h1 class="mt-4">Page Not Found</h1>
      
      <p class="text-muted mb-4">
        The page you are looking for doesn't exist or has been moved.
      </p>
      
      <div class="d-flex flex-column flex-sm-row justify-content-center gap-2">
        <button 
          class="btn btn-outline-secondary" 
          @click="goBack"
        >
          <i class="bi bi-arrow-left me-1"></i> Go Back
        </button>
        
        <router-link 
          to="/dashboard" 
          class="btn btn-primary"
        >
          <i class="bi bi-house-door me-1"></i> Go to Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f9fa;
}

.not-found-content {
  max-width: 500px;
  padding: 3rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 5rem;
  font-weight: 700;
  color: #dc3545;
  line-height: 1;
  margin-bottom: 1rem;
}

.not-found-icon {
  font-size: 4rem;
  color: #ffc107;
}

h1 {
  font-size: 2rem;
  font-weight: 600;
}

@media (max-width: 576px) {
  .not-found-content {
    padding: 2rem;
  }
  
  .error-code {
    font-size: 4rem;
  }
  
  .not-found-icon {
    font-size: 3rem;
  }
  
  h1 {
    font-size: 1.75rem;
  }
}
</style>