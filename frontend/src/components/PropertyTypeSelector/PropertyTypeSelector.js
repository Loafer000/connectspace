import React from 'react';
import { Link } from 'react-router-dom';

const PropertyTypeSelector = () => {
  return (
    <div className="w-full bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-6">
          <Link 
            to="/commercial"
            className="px-6 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏢</span>
              <span className="font-medium">Commercial Space</span>
            </div>
          </Link>
          <Link 
            to="/residential"
            className="px-6 py-3 rounded-lg bg-white border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all"
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🏠</span>
              <span className="font-medium">Residential Space</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeSelector;