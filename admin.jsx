import React from 'react';
import { AdminProvider } from './components/AdminContext';
import AdminApp from './components/AdminApp';

export default function Admin() {
  return (
    <AdminProvider>
      <AdminApp />
    </AdminProvider>
  );
}
