import api from './api';

export const SettingService = {
  get() {
    return api.get('/settings');
  },
  
  update(settings) {
    // Use FormData for settings with images (logo, favicon)
    const formData = new FormData();
    
    Object.keys(settings).forEach(key => {
      if ((key === 'logo' || key === 'favicon') && settings[key] instanceof File) {
        formData.append(key, settings[key]);
      } else if (settings[key] !== null && settings[key] !== undefined) {
        formData.append(key, settings[key]);
      }
    });
    
    return api.post('/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};