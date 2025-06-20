import React, { Suspense, lazy } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import HomePage from './HomePage';
const SearchResultsPage = lazy(() => import('./SearchResultsPage'));
const AboutPage = lazy(() => import('./AboutPage'));
import { useApp } from './context.jsx';

const CharismaMoveApp = () => {
  const { currentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'search-results':
        return <SearchResultsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>
        <Suspense fallback={<div className="p-8">Chargement...</div>}>
          {renderPage()}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default CharismaMoveApp;
