import React, { useState } from 'react';

export const AppContext = React.createContext();

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setTokenState] = useState(() => localStorage.getItem('token'));

  const setToken = (t) => {
    if (t) {
      localStorage.setItem('token', t);
    } else {
      localStorage.removeItem('token');
    }
    setTokenState(t);
  };
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  const value = {
    currentPage,
    setCurrentPage,
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    token,
    setToken,
    searchResults,
    setSearchResults,
    isLoading,
    setIsLoading,
    searchParams,
    setSearchParams
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
