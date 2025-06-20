import React from 'react';
import AdminNavigation from './AdminNavigation';
import Footer from './Footer';
import AdminDashboard from './AdminDashboard';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';
import { useAdmin } from './AdminContext.jsx';

const AdminApp = () => {
  const { currentPage } = useAdmin();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <AdminUsers />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <AdminNavigation />
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
};

export default AdminApp;
