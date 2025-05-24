import api from './api';

export const UserService = {
  getAll() {
    return api.get('/users');
  },
  
  get(id) {
    return api.get(`/users/${id}`);
  },
  
  create(user) {
    return api.post('/users', user);
  },
  
  update(id, user) {
    return api.put(`/users/${id}`, user);
  },
  
  delete(id) {
    return api.delete(`/users/${id}`);
  },
};
