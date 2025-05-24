import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';  // <-- import plugin
import App from './App.vue';
import router from './router';

// Import Bootstrap and icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'sweetalert2/dist/sweetalert2.min.css';


const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);  // <-- gunakan plugin

app.use(pinia);
app.use(router);

// globalProperties tetap sama
app.config.globalProperties.$formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
};

app.config.globalProperties.$formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

app.mount('#app');
