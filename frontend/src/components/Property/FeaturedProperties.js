import React from 'react';
import PropertyCard from './PropertyCard';
import LoadingSpinner from '../Common/LoadingSpinner';

const FeaturedProperties = ({ properties = [], loading = false }) => {
  // Real featured properties passed as props or from API
  const featuredProperties = properties || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredProperties.length === 0 ? (
        <div className="col-span-full text-center py-12 text-gray-500">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">No Properties Yet</p>
            <p className="text-sm text-gray-600 mb-4">Be the first to add your premium commercial space!</p>
            <p className="text-xs text-gray-500">New properties will appear here once landlords start listing.</p>
          </div>
        </div>
      ) : (
        featuredProperties.map((property) => (
          <PropertyCard key={property._id || property.id} property={property} />
        ))
      )}
    </div>
  );
};

export default FeaturedProperties;
