import { defineStore } from 'pinia';
import { DashboardService } from '../services/dashboard.service';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    summary: null,
    salesByPeriod: [],
    topProducts: [],
    topCustomers: [],
    recentSales: [],
    inventoryStatus: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    getSummary: (state) => state.summary,
    getSalesByPeriod: (state) => state.salesByPeriod,
    getTopProducts: (state) => state.topProducts,
    getTopCustomers: (state) => state.topCustomers,
    getRecentSales: (state) => state.recentSales,
    getInventoryStatus: (state) => state.inventoryStatus,
  },
  
  actions: {
    async fetchDashboardData() {
      this.loading = true;
      try {
        // Fetch all dashboard data in parallel
        const [
          summaryResponse,
          salesResponse,
          productsResponse,
          customersResponse,
          recentSalesResponse,
          inventoryResponse
        ] = await Promise.all([
          DashboardService.getSummary(),
          DashboardService.getSalesByPeriod('monthly'),
          DashboardService.getTopProducts(),
          DashboardService.getTopCustomers(),
          DashboardService.getRecentSales(),
          DashboardService.getInventoryStatus()
        ]);
        
        this.summary = summaryResponse.data.data;
        this.salesByPeriod = salesResponse.data.data;
        this.topProducts = productsResponse.data.data;
        this.topCustomers = customersResponse.data.data;
        this.recentSales = recentSalesResponse.data.data;
        this.inventoryStatus = inventoryResponse.data.data;
        
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching dashboard data:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchSalesByPeriod(period) {
      this.loading = true;
      try {
        const response = await DashboardService.getSalesByPeriod(period);
        this.salesByPeriod = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching sales by period:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});