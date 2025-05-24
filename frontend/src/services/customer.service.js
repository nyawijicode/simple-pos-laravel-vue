import api from './api';

export const CustomerService = {
  getAll() {
    return api.get('/customers');
  },
  
  get(id) {
    return api.get(`/customers/${id}`);
  },
  
  create(customer) {
    return api.post('/customers', customer);
  },
  
  update(id, customer) {
    return api.put(`/customers/${id}`, customer);
  },
  
  delete(id) {
    return api.delete(`/customers/${id}`);
  },
  
  getSales(id, params = {}) {
    return api.get(`/customers/${id}/sales`, { params });
  },
  
  getStats(id) {
    return api.get(`/customers/${id}/stats`);
  }
};