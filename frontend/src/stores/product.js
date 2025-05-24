import { defineStore } from 'pinia';
import { ProductService } from '../services/product.service';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    currentProduct: null,
    lowStockProducts: [],
    loading: false,
    error: null,
  }),
  
  getters: {
    getProducts: (state) => state.products,
    getProductById: (state) => (id) => state.products.find(product => product.id === id),
    getActiveProducts: (state) => state.products.filter(product => product.is_active),
    getProductsByCategory: (state) => (categoryId) => 
      state.products.filter(product => product.category_id === categoryId),
    getLowStockProducts: (state) => state.lowStockProducts,
    getOutOfStockProducts: (state) => state.products.filter(product => product.stock <= 0),
  },
  
  actions: {
    async fetchProducts() {
      this.loading = true;
      try {
        const response = await ProductService.getAll();
        this.products = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching products:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchProduct(id) {
      this.loading = true;
      try {
        const response = await ProductService.get(id);
        this.currentProduct = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createProduct(product) {
      this.loading = true;
      try {
        const response = await ProductService.create(product);
        this.products.push(response.data.data);
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error creating product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateProduct(id, product) {
      this.loading = true;
      try {
        const response = await ProductService.update(id, product);
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = response.data.data;
        }
        this.currentProduct = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error updating product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteProduct(id) {
      this.loading = true;
      try {
        await ProductService.delete(id);
        this.products = this.products.filter(product => product.id !== id);
        if (this.currentProduct && this.currentProduct.id === id) {
          this.currentProduct = null;
        }
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error deleting product:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchLowStockProducts() {
      this.loading = true;
      try {
        const response = await ProductService.getLowStock();
        this.lowStockProducts = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching low stock products:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async updateStock(productId, quantity, type, notes) {
      this.loading = true;
      try {
        const response = await ProductService.updateStock(productId, quantity, type, notes);
        // Update product in list
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
          this.products[index].stock = response.data.data.stock;
        }
        // Update current product if it's the same
        if (this.currentProduct && this.currentProduct.id === productId) {
          this.currentProduct.stock = response.data.data.stock;
        }
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error updating stock:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});