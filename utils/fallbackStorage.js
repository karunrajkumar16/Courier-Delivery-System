let isMongoAvailable = false;
let fallbackData = {
  users: [],
  packages: [],
  counter: 1
};

const initializeFallbackStorage = () => {
  if (typeof localStorage !== 'undefined') {
    try {
      const users = JSON.parse(localStorage.getItem('rjcouriers_customers')) || [];
      const packages = JSON.parse(localStorage.getItem('rjcouriers_packages')) || [];
      const counter = parseInt(localStorage.getItem('rjcouriers_counter')) || 1;
      
      fallbackData = { users, packages, counter };
      console.log('Fallback storage initialized from localStorage');
    } catch (err) {
      console.error('Error initializing fallback storage:', err);
    }
  }
};

const setMongoAvailability = (status) => {
  isMongoAvailable = status;
  console.log(`MongoDB availability set to: ${status}`);
};

const isMongoDBAvailable = () => isMongoAvailable;

const saveUser = (user) => {
  if (!user.id) {
    user.id = Date.now().toString();
  }
  
  const existingUserIndex = fallbackData.users.findIndex(u => u.email === user.email);
  
  if (existingUserIndex >= 0) {
    fallbackData.users[existingUserIndex] = user;
  } else {
    fallbackData.users.push(user);
  }
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('rjcouriers_customers', JSON.stringify(fallbackData.users));
  }
  
  return user;
};

const findUserByEmail = (email) => {
  return fallbackData.users.find(u => u.email === email) || null;
};

const findUserById = (id) => {
  return fallbackData.users.find(u => u.id === id) || null;
};

const savePackage = (pkg) => {
  if (!pkg.id) {
    pkg.id = Date.now().toString();
  }
  
  if (!pkg.trackingId) {
    const counter = fallbackData.counter++;
    pkg.trackingId = `RJC${new Date().toISOString().slice(0,10).replace(/-/g,'')}${counter.toString().padStart(3, '0')}`;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('rjcouriers_counter', fallbackData.counter.toString());
    }
  }
  
  const existingPackageIndex = fallbackData.packages.findIndex(p => p.id === pkg.id);
  
  if (existingPackageIndex >= 0) {
    fallbackData.packages[existingPackageIndex] = pkg;
  } else {
    fallbackData.packages.push(pkg);
  }
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('rjcouriers_packages', JSON.stringify(fallbackData.packages));
  }
  
  return pkg;
};

const findPackagesByCustomerId = (customerId) => {
  return fallbackData.packages.filter(p => p.customerId === customerId);
};

const findPackageByTrackingId = (trackingId) => {
  return fallbackData.packages.find(p => p.trackingId === trackingId) || null;
};

const findPackageById = (id) => {
  return fallbackData.packages.find(p => p.id === id) || null;
};

module.exports = {
  initializeFallbackStorage,
  setMongoAvailability,
  isMongoDBAvailable,
  saveUser,
  findUserByEmail,
  findUserById,
  savePackage,
  findPackagesByCustomerId,
  findPackageByTrackingId,
  findPackageById
};