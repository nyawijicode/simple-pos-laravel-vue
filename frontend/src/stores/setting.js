import { defineStore } from 'pinia';
import { SettingService } from '../services/setting.service';

export const useSettingStore = defineStore('setting', {
  state: () => ({
    settings: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    getSettings: (state) => state.settings,
    getCompanyName: (state) => state.settings?.company_name || 'Simple POS',
    getTaxRate: (state) => state.settings?.tax_rate || 0,
    getCurrency: (state) => state.settings?.currency || 'IDR',
    getLogoUrl: (state) => state.settings?.logo || null,
  },
  
  actions: {
    async fetchSettings() {
      this.loading = true;
      try {
        const response = await SettingService.get();
        this.settings = response.data.data;
        this.error = null;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error fetching settings:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async updateSettings(settings) {
      this.loading = true;
      try {
        const response = await SettingService.update(settings);
        this.settings = response.data.data;
        this.error = null;
        return response.data.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Something went wrong';
        console.error('Error updating settings:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});