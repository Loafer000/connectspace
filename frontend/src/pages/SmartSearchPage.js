import React, { useState, useCallback } from 'react';
import AdvancedSearch from '../components/Search/AdvancedSearch';
import SmartSearchResults from '../components/Search/SmartSearchResults';
import { FavoritesList } from '../components/Favorites/PropertyFavorites';
import './SmartSearchPage.css';

const SmartSearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilters, setCurrentFilters] = useState({});
  const [activeTab, setActiveTab] = useState('search');

  const handleSearchResults = useCallback((results) => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setSearchResults(results);
      setIsLoading(false);
    }, 800);
  }, []);

  const handleFiltersChange = useCallback((filters) => {
    setCurrentFilters(filters);
  }, []);

  // Initialize with sample data on first load
  React.useEffect(() => {
    handleSearchResults([]);
  }, [handleSearchResults]);

  const getTabContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <div className="search-tab-content">
            <AdvancedSearch 
              onSearchResults={handleSearchResults}
              onFiltersChange={handleFiltersChange}
            />
            <SmartSearchResults
              searchResults={searchResults}
              isLoading={isLoading}
              searchQuery={searchQuery}
              filters={currentFilters}
            />
          </div>
        );
      case 'favorites':
        return <FavoritesList />;
      default:
        return null;
    }
  };

  return (
    <div className="smart-search-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Find Your Perfect Property</h1>
          <p>Advanced search with smart filtering and personalized recommendations</p>
        </div>
        
        <div className="header-stats">
          <div className="stat-item">
            <div className="stat-number">{searchResults.length}+</div>
            <div className="stat-label">Properties</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Locations</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support</div>
          </div>
        </div>
      </div>

      <div className="page-navigation">
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <span className="tab-icon">🔍</span>
            <span>Smart Search</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <span className="tab-icon">❤️</span>
            <span>My Favorites</span>
          </button>
        </div>
      </div>

      <div className="page-content">
        {getTabContent()}
      </div>

      {/* Quick Tips */}
      <div className="search-tips">
        <h3>Search Tips</h3>
        <div className="tips-grid">
          <div className="tip-item">
            <div className="tip-icon">💡</div>
            <div className="tip-content">
              <strong>Use specific keywords</strong>
              <p>Try "pet-friendly downtown apartment" for better results</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-icon">🎯</div>
            <div className="tip-content">
              <strong>Save your searches</strong>
              <p>Get notified when new properties match your criteria</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-icon">❤️</div>
            <div className="tip-content">
              <strong>Heart your favorites</strong>
              <p>Build a collection of properties you love</p>
            </div>
          </div>
          <div className="tip-item">
            <div className="tip-icon">📱</div>
            <div className="tip-content">
              <strong>Mobile optimized</strong>
              <p>Search on-the-go with our responsive design</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSearchPage;

