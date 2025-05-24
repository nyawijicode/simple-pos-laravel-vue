import api from './api';

export const AuthService = {
  login(credentials) {
    return api.post('/login', credentials);
  },
  
  register(user) {
    return api.post('/register', user);
  },
  
  logout() {
    return api.post('/logout');
  },
  
  getUser() {
    return api.get('/user');
  },
};