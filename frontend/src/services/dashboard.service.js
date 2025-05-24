import api from './api';

export const DashboardService = {
  getSummary() {
    return api.get('/dashboard');
  },
  
  getSalesByPeriod(period) {
    return api.get('/dashboard/sales', { 
      params: { period } // daily, weekly, monthly, yearly
    });
  },
  
  getTopProducts() {
    return api.get('/dashboard/top-products');
  },
  
  getTopCustomers() {
    return api.get('/dashboard/top-customers');
  },
  
  getRecentSales() {
    return api.get('/dashboard/recent-sales');
  },
  
  getInventoryStatus() {
    return api.get('/dashboard/inventory');
  }
};
