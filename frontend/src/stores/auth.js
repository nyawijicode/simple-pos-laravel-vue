import { defineStore } from "pinia";
import router from "../router";
import { AuthService } from "../services/auth.service";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token") || false,
  }),

  getters: {
    getUser: (state) => state.user,
    isAdmin: (state) => state.user?.roles?.includes("admin") || false,
    isManager: (state) => state.user?.roles?.includes("manager") || false,
    isCashier: (state) => state.user?.roles?.includes("cashier") || false,
    hasPermission: (state) => (permission) => {
      return state.user?.permissions?.includes(permission) || false;
    },
  },

  actions: {
    async login(credentials) {
      try {
        const response = await AuthService.login(credentials);
        this.user = response.data.user;
        this.token = response.data.token;
        this.isAuthenticated = true;
        localStorage.setItem("token", response.data.token);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    async register(user) {
      try {
        const response = await AuthService.register(user);
        this.user = response.data.user;
        this.token = response.data.token;
        this.isAuthenticated = true;
        localStorage.setItem("token", response.data.token);
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    async logout() {
      try {
        if (this.isAuthenticated) {
          await AuthService.logout();
        }
      } finally {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem("token");
        router.push("/login");
      }
    },

    async fetchUser() {
      try {
        const response = await AuthService.getUser();
        this.user = response.data;
        return Promise.resolve(response);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },
   persist: true,
});
