import { defineStore } from 'pinia';
import { CustomerService } from '../services/customer.service';

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [],
    currentCustomer: null,
    customerSales: [],
    customerStats: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    getCustomers: (state) => state.customers,
    getCustomerById: (state) => (id) => state.customers.find(customer => customer.id === id),
    getActiveCustomers: (state) => state.customers.filter(customer => customer.is_active),
    getCustomerSales: (state) => state.customerSales,
    getCustomerStats: (state) => state.customerStats,
  },
  
  actions: {
    async fetchCustomers() {
      this.loading = true;
      try {
        const response = await CustomerService.getAll();
        this.customers = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching customers:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCustomer(id) {
      this.loading = true;
      try {
        const response = await CustomerService.get(id);
        this.currentCustomer = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching customer:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createCustomer(customer) {
      this.loading = true;
      try {
        const response = await CustomerService.create(customer);
        this.customers.push(response.data.data);
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error creating customer:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateCustomer(id, customer) {
      this.loading = true;
      try {
        const response = await CustomerService.update(id, customer);
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
          this.customers[index] = response.data.data;
        }
        this.currentCustomer = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error updating customer:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteCustomer(id) {
      this.loading = true;
      try {
        await CustomerService.delete(id);
        this.customers = this.customers.filter(customer => customer.id !== id);
        if (this.currentCustomer && this.currentCustomer.id === id) {
          this.currentCustomer = null;
        }
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error deleting customer:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCustomerSales(id, params = {}) {
      this.loading = true;
      try {
        const response = await CustomerService.getSales(id, params);
        this.customerSales = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching customer sales:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCustomerStats(id) {
      this.loading = true;
      try {
        const response = await CustomerService.getStats(id);
        this.customerStats = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching customer stats:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});