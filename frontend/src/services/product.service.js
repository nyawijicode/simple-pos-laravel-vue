import api from './api';

export const ProductService = {
  getAll() {
    return api.get('/products');
  },
  
  get(id) {
    return api.get(`/products/${id}`);
  },
  
  create(product) {
    // Use FormData for products with images
    const formData = new FormData();
    
    Object.keys(product).forEach(key => {
      if (key === 'image' && product[key] instanceof File) {
        formData.append(key, product[key]);
      } else if (product[key] !== null && product[key] !== undefined) {
        formData.append(key, product[key]);
      }
    });
    
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  update(id, product) {
    // Use FormData for products with images
    const formData = new FormData();
    
    // For PUT/PATCH requests with FormData, we need to add _method
    formData.append('_method', 'PUT');
    
    Object.keys(product).forEach(key => {
      if (key === 'image' && product[key] instanceof File) {
        formData.append(key, product[key]);
      } else if (product[key] !== null && product[key] !== undefined) {
        formData.append(key, product[key]);
      }
    });
    
    return api.post(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  delete(id) {
    return api.delete(`/products/${id}`);
  },
  
  getLowStock() {
    return api.get('/products/low-stock');
  },
  
  updateStock(id, quantity, type, notes) {
    return api.post(`/products/${id}/stock`, {
      quantity,
      type, // 'in' or 'out'
      notes
    });
  }
};