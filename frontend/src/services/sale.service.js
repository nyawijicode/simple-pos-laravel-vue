import api from './api';

export const SaleService = {
  getAll() {
    return api.get('/sales');
  },
  
  get(id) {
    return api.get(`/sales/${id}`);
  },
  
  create(sale) {
    return api.post('/sales', sale);
  },
  
  update(id, data) {
    return api.put(`/sales/${id}`, data);
  },
  
  delete(id) {
    return api.delete(`/sales/${id}`);
  },
  
  getReport(params) {
    return api.get('/sales/report', { params });
  },
  
  downloadInvoice(id) {
    return api.get(`/sales/${id}/invoice`, {
      responseType: 'blob'
    });
  }
};
