
const API_BASE_URL = 'http://localhost:5000/api';

const API = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Registration failed');
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Login failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('rjcouriers_token', data.token);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('rjcouriers_token');
    localStorage.removeItem('rjcouriers_user');
  },
  
  getUserProfile: async () => {
    try {
      const token = localStorage.getItem('rjcouriers_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to get user profile');
      }
      
      localStorage.setItem('rjcouriers_user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },
  
  updateUserProfile: async (userData) => {
    try {
      const token = localStorage.getItem('rjcouriers_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update profile');
      }
      
      localStorage.setItem('rjcouriers_user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  createPackage: async (packageData) => {
    try {
      const token = localStorage.getItem('rjcouriers_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(packageData)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to create package');
      }
      
      return data;
    } catch (error) {
      console.error('Create package error:', error);
      throw error;
    }
  },
  
  getUserPackages: async () => {
    try {
      const token = localStorage.getItem('rjcouriers_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to get packages');
      }
      
      return data;
    } catch (error) {
      console.error('Get packages error:', error);
      throw error;
    }
  },
  
  getPackageById: async (packageId) => {
    try {
      const token = localStorage.getItem('rjcouriers_token');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to get package');
      }
      
      return data;
    } catch (error) {
      console.error('Get package error:', error);
      throw error;
    }
  },
  
  trackPackage: async (trackingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/track/${trackingId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to track package');
      }
      
      return data;
    } catch (error) {
      console.error('Track package error:', error);
      throw error;
    }
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('rjcouriers_token') !== null;
  },
  
  getCurrentUser: () => {
    const userJson = localStorage.getItem('rjcouriers_user');
    return userJson ? JSON.parse(userJson) : null;
  }
};