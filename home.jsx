import React from 'react';
import { AppProvider } from './components/context';
import CharismaMoveApp from './components/CharismaMoveApp';

export default function App() {
  return (
    <AppProvider>
      <CharismaMoveApp />
    </AppProvider>
  );
}
