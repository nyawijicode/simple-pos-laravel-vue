import api from './api';

export const CategoryService = {
  getAll() {
    return api.get('/categories');
  },
  
  get(id) {
    return api.get(`/categories/${id}`);
  },
  
  create(category) {
    return api.post('/categories', category);
  },
  
  update(id, category) {
    return api.put(`/categories/${id}`, category);
  },
  
  delete(id) {
    return api.delete(`/categories/${id}`);
  }
};