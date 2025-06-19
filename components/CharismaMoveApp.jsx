import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import HomePage from './HomePage';
import SearchResultsPage from './SearchResultsPage';
import AboutPage from './AboutPage';
import { useApp } from './context';

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
      <main>{renderPage()}</main>
      <Footer />
    </div>
  );
};

export default CharismaMoveApp;
