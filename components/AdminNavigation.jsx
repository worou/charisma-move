import React, { useState } from 'react';
import { Menu, X, Home, Users, Settings, LogOut } from 'lucide-react';
import { useAdmin } from './AdminContext.jsx';

const AdminNavigation = () => {
  const { currentPage, setCurrentPage, setIsAuthenticated, setAdminUser, setToken } = useAdmin();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Param\u00e8tres', icon: <Settings className="w-4 h-4" /> },
    { id: 'logout', label: 'D\u00e9connexion', icon: <LogOut className="w-4 h-4" /> },
  ];

  const handleClick = (id) => {
    if (id === 'logout') {
      setIsAuthenticated(false);
      setAdminUser(null);
      setToken(null);
      setCurrentPage('dashboard');
    } else {
      setCurrentPage(id);
    }
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={() => setCurrentPage('dashboard')} className="text-xl font-bold text-purple-600">
              Admin
            </button>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleClick(item.id)}
                  className={`px-3 py-2 text-sm font-medium transition-colors flex items-center ${
                    currentPage === item.id ? 'text-purple-600 bg-purple-50' : 'text-gray-900 hover:text-purple-600'
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-600">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleClick(item.id);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-900 hover:text-purple-600"
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default AdminNavigation;
