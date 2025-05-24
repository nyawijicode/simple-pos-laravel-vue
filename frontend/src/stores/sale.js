import { defineStore } from 'pinia';
import { SaleService } from '../services/sale.service';

export const useSaleStore = defineStore('sale', {
  state: () => ({
    sales: [],
    currentSale: null,
    saleReport: null,
    cartItems: [],
    customer: null,
    discount: 0,
    tax: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    notes: '',
    loading: false,
    error: null,
  }),
  
  getters: {
    getSales: (state) => state.sales,
    getSaleById: (state) => (id) => state.sales.find(sale => sale.id === id),
    getCartItems: (state) => state.cartItems,
    getCartTotal: (state) => {
      return state.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },
    getCartSubtotal: (state) => {
      return state.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0) - state.discount;
    },
    getCartTaxAmount: (state, getters) => {
      if (state.tax > 0) {
        return getters.getCartSubtotal * (state.tax / 100);
      }
      return 0;
    },
    getCartFinalTotal: (state, getters) => {
      return getters.getCartSubtotal + getters.getCartTaxAmount;
    },
    getCartChange: (state, getters) => {
      return Math.max(0, state.paidAmount - getters.getCartFinalTotal);
    },
  },
  
  actions: {
    async fetchSales() {
      this.loading = true;
      try {
        const response = await SaleService.getAll();
        this.sales = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching sales:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSale(id) {
      this.loading = true;
      try {
        const response = await SaleService.get(id);
        this.currentSale = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching sale:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createSale() {
      if (this.cartItems.length === 0) {
        this.error = 'Cart is empty';
        return null;
      }
      
      this.loading = true;
      
      try {
        const saleData = {
          customer_id: this.customer?.id || null,
          items: this.cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          discount: this.discount,
          tax: this.tax,
          paid_amount: this.paidAmount,
          payment_method: this.paymentMethod,
          notes: this.notes,
        };
        
        const response = await SaleService.create(saleData);
        this.sales.unshift(response.data.data);
        this.currentSale = response.data.data;
        this.error = null;
        
        // Clear cart after successful sale
        this.clearCart();
        
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error creating sale:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateSale(id, saleData) {
      this.loading = true;
      try {
        const response = await SaleService.update(id, saleData);
        const index = this.sales.findIndex(s => s.id === id);
        if (index !== -1) {
          this.sales[index] = response.data.data;
        }
        this.currentSale = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error updating sale:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async cancelSale(id, notes) {
      return this.updateSale(id, {
        status: 'cancelled',
        notes: notes || 'Cancelled by user',
      });
    },
    
    async deleteSale(id) {
      this.loading = true;
      try {
        await SaleService.delete(id);
        this.sales = this.sales.filter(sale => sale.id !== id);
        if (this.currentSale && this.currentSale.id === id) {
          this.currentSale = null;
        }
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error deleting sale:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSaleReport(params) {
      this.loading = true;
      try {
        const response = await SaleService.getReport(params);
        this.saleReport = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching sale report:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async downloadInvoice(id) {
      this.loading = true;
      try {
        const response = await SaleService.downloadInvoice(id);
        
        // Create a blob from the response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        
        // Create a URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link and click it to download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error downloading invoice:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    // Cart management actions
    addToCart(product, quantity = 1) {
      if (product.stock < quantity) {
        this.error = 'Not enough stock';
        return;
      }
      
      const existingItem = this.cartItems.find(item => item.id === product.id);
      
      if (existingItem) {
        if (existingItem.quantity + quantity > product.stock) {
          this.error = 'Not enough stock';
          return;
        }
        existingItem.quantity += quantity;
      } else {
        this.cartItems.push({
          id: product.id,
          name: product.name,
          code: product.code,
          price: product.price,
          quantity: quantity,
          stock: product.stock,
        });
      }
      
      this.error = null;
    },
    
    removeFromCart(productId) {
      this.cartItems = this.cartItems.filter(item => item.id !== productId);
    },
    
    updateCartItemQuantity(productId, quantity) {
      const item = this.cartItems.find(item => item.id === productId);
      if (item) {
        if (quantity > item.stock) {
          this.error = 'Not enough stock';
          return;
        }
        
        if (quantity <= 0) {
          this.removeFromCart(productId);
        } else {
          item.quantity = quantity;
        }
      }
    },
    
    setCustomer(customer) {
      this.customer = customer;
    },
    
    setDiscount(amount) {
      this.discount = amount;
    },
    
    setTax(amount) {
      this.tax = amount;
    },
    
    setPaidAmount(amount) {
      this.paidAmount = amount;
    },
    
    setPaymentMethod(method) {
      this.paymentMethod = method;
    },
    
    setNotes(notes) {
      this.notes = notes;
    },
    
    clearCart() {
      this.cartItems = [];
      this.customer = null;
      this.discount = 0;
      this.tax = 0;
      this.paidAmount = 0;
      this.paymentMethod = 'cash';
      this.notes = '';
    },
  },
});