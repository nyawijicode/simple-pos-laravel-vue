import { defineStore } from 'pinia';
import { UserService } from '../services/user.service';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    getUsers: (state) => state.users,
    getUserById: (state) => (id) => state.users.find(user => user.id === id),
  },
  
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await UserService.getAll();
        this.users = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUser(id) {
      this.loading = true;
      try {
        const response = await UserService.get(id);
        this.currentUser = response.data.data;
        this.error = null;
        return Promise.resolve(response);
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        return Promise.reject(error);
      } finally {
        this.loading = false;
      }
    },
    
    async createUser(user) {
      this.loading = true;
      try {
        const response = await UserService.create(user);
        this.users.push(response.data.data);
        this.error = null;
        return Promise.resolve(response);
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        return Promise.reject(error);
      } finally {
        this.loading = false;
      }
    },
    
    async updateUser(id, user) {
      this.loading = true;
      try {
        const response = await UserService.update(id, user);
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
          this.users[index] = response.data.data;
        }
        this.error = null;
        return Promise.resolve(response);
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        return Promise.reject(error);
      } finally {
        this.loading = false;
      }
    },
    
    async deleteUser(id) {
      this.loading = true;
      try {
        await UserService.delete(id);
        this.users = this.users.filter(user => user.id !== id);
        this.error = null;
        return Promise.resolve();
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        return Promise.reject(error);
      } finally {
        this.loading = false;
      }
    },
  },
});