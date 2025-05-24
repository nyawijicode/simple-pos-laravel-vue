import { defineStore } from 'pinia';
import { CategoryService } from '../services/category.service';

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    currentCategory: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    getCategories: (state) => state.categories,
    getCategoryById: (state) => (id) => state.categories.find(category => category.id === id),
    getActiveCategories: (state) => state.categories.filter(category => category.is_active),
  },
  
  actions: {
    async fetchCategories() {
      this.loading = true;
      try {
        const response = await CategoryService.getAll();
        this.categories = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching categories:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCategory(id) {
      this.loading = true;
      try {
        const response = await CategoryService.get(id);
        this.currentCategory = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createCategory(category) {
      this.loading = true;
      try {
        const response = await CategoryService.create(category);
        this.categories.push(response.data.data);
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error creating category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateCategory(id, category) {
      this.loading = true;
      try {
        const response = await CategoryService.update(id, category);
        const index = this.categories.findIndex(c => c.id === id);
        if (index !== -1) {
          this.categories[index] = response.data.data;
        }
        this.currentCategory = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error updating category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteCategory(id) {
      this.loading = true;
      try {
        await CategoryService.delete(id);
        this.categories = this.categories.filter(category => category.id !== id);
        if (this.currentCategory && this.currentCategory.id === id) {
          this.currentCategory = null;
        }
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error deleting category:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});