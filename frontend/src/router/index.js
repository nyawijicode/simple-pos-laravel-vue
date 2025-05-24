import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Lazy loading components
const Login = () => import('../components/auth/Login.vue');
const Register = () => import('../components/auth/Register.vue');
const Dashboard = () => import('../components/dashboard/Dashboard.vue');
const Products = () => import('../components/products/Products.vue');
const ProductForm = () => import('../components/products/ProductForm.vue');
const Categories = () => import('../components/categories/Categories.vue');
const CategoryForm = () => import('../components/categories/CategoryForm.vue');
const Customers = () => import('../components/customers/Customers.vue');
const CustomerForm = () => import('../components/customers/CustomerForm.vue');
const Sales = () => import('../components/sales/Sales.vue');
const SaleDetail = () => import('../components/sales/SaleDetail.vue');
const POS = () => import('../components/pos/POS.vue');
const Users = () => import('../components/users/Users.vue');
const UserForm = () => import('../components/users/UserForm.vue');
const Settings = () => import('../components/settings/Settings.vue');
const Profile = () => import('../components/auth/Profile.vue');
const NotFound = () => import('../components/NotFound.vue');

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, permission: 'dashboard-view' },
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: { requiresAuth: true, permission: 'product-list' },
  },
  {
    path: '/products/create',
    name: 'ProductCreate',
    component: ProductForm,
    meta: { requiresAuth: true, permission: 'product-create' },
  },
  {
    path: '/products/:id/edit',
    name: 'ProductEdit',
    component: ProductForm,
    meta: { requiresAuth: true, permission: 'product-edit' },
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
    meta: { requiresAuth: true, permission: 'category-list' },
  },
  {
    path: '/categories/create',
    name: 'CategoryCreate',
    component: CategoryForm,
    meta: { requiresAuth: true, permission: 'category-create' },
  },
  {
    path: '/categories/:id/edit',
    name: 'CategoryEdit',
    component: CategoryForm,
    meta: { requiresAuth: true, permission: 'category-edit' },
  },
  {
    path: '/customers',
    name: 'Customers',
    component: Customers,
    meta: { requiresAuth: true, permission: 'customer-list' },
  },
  {
    path: '/customers/create',
    name: 'CustomerCreate',
    component: CustomerForm,
    meta: { requiresAuth: true, permission: 'customer-create' },
  },
  {
    path: '/customers/:id/edit',
    name: 'CustomerEdit',
    component: CustomerForm,
    meta: { requiresAuth: true, permission: 'customer-edit' },
  },
  {
    path: '/sales',
    name: 'Sales',
    component: Sales,
    meta: { requiresAuth: true, permission: 'sale-list' },
  },
  {
    path: '/sales/:id',
    name: 'SaleDetail',
    component: SaleDetail,
    meta: { requiresAuth: true, permission: 'sale-list' },
  },
  {
    path: '/pos',
    name: 'POS',
    component: POS,
    meta: { requiresAuth: true, permission: 'sale-create' },
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true, permission: 'user-list' },
  },
  {
    path: '/users/create',
    name: 'UserCreate',
    component: UserForm,
    meta: { requiresAuth: true, permission: 'user-create' },
  },
  {
    path: '/users/:id/edit',
    name: 'UserEdit',
    component: UserForm,
    meta: { requiresAuth: true, permission: 'user-edit' },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true, permission: 'setting-edit' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Check if the route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login' });
  }
  
  // Check if the route requires guest
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' });
  }
  
  // Check if the user has the required permission
  if (to.meta.permission && authStore.isAuthenticated) {
    // Ensure user data is loaded
    if (!authStore.user) {
      try {
        await authStore.fetchUser();
      } catch (error) {
        authStore.logout();
        return next({ name: 'Login' });
      }
    }
    
    if (!authStore.hasPermission(to.meta.permission)) {
      return next({ name: 'Dashboard' });
    }
  }
  
  next();
});

export default router;