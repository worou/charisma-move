import React, { useState } from 'react';

export const AdminContext = React.createContext();

export const useAdmin = () => {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setTokenState] = useState(() => localStorage.getItem('adminToken'));

  const setToken = (t) => {
    if (t) {
      localStorage.setItem('adminToken', t);
    } else {
      localStorage.removeItem('adminToken');
    }
    setTokenState(t);
  };

  const value = {
    currentPage,
    setCurrentPage,
    adminUser,
    setAdminUser,
    isAuthenticated,
    setIsAuthenticated,
    token,
    setToken,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
