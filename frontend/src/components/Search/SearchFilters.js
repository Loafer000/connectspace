import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProperty } from '../../contexts/PropertyContext';

const SearchFilters = () => {
  const [searchParams] = useSearchParams();
  const { filters, dispatch } = useProperty();
  const [localFilters, setLocalFilters] = useState({
    rentRange: { min: 0, max: 100000 },
    sizeRange: { min: 0, max: 10000 },
    propertyTypes: [],
    capacity: '',
    floorLevel: '',
    amenities: [],
    verified: false,
    availability: 'all',
    ...filters
  });
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);

  // Sync local filters with context filters
  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      ...filters
    }));
  }, [filters]);

  const { searchProperties } = useProperty();

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...localFilters,
      [key]: value
    };
    setLocalFilters(newFilters);
    dispatch({ type: 'SET_FILTERS', payload: { [key]: value } });
    
    // Build search query from filters
    const searchQuery = {
      location: searchParams.get('q') || searchParams.get('location') || newFilters.location || '',
      propertyType: searchParams.get('propertyType') || (Array.isArray(newFilters.propertyTypes) && newFilters.propertyTypes.length > 0 
        ? newFilters.propertyTypes[0] 
        : ''),
      minPrice: newFilters.rentRange?.min || '',
      maxPrice: newFilters.rentRange?.max || '',
      capacity: newFilters.capacity || '',
      amenities: newFilters.amenities || []
    };
    
    // Trigger search with new filters
    searchProperties(searchQuery);
  };

  const handleRangeChange = (key, type, value) => {
    const newRange = {
      ...(localFilters[key] || { min: 0, max: 100000 }),
      [type]: parseInt(value) || 0
    };
    setLocalFilters(prev => ({
      ...prev,
      [key]: newRange
    }));
    dispatch({ type: 'SET_FILTERS', payload: { [key]: newRange } });

    // Build search query
    const searchQuery = {
      location: searchParams.get('q') || searchParams.get('location') || localFilters.location || '',
      propertyType: searchParams.get('propertyType') || (Array.isArray(localFilters.propertyTypes) && localFilters.propertyTypes.length > 0 
        ? localFilters.propertyTypes[0] 
        : ''),
      rentRange: newRange,
      minPrice: newRange.min,
      maxPrice: newRange.max,
      capacity: localFilters.capacity || '',
      amenities: localFilters.amenities || []
    };
    
    // Trigger search with new range values
    searchProperties(searchQuery);
  };

  const togglePropertyType = (type) => {
    const newTypes = selectedPropertyTypes.includes(type)
      ? selectedPropertyTypes.filter(t => t !== type)
      : [...selectedPropertyTypes, type];
    
    setSelectedPropertyTypes(newTypes);
    const newFilters = {
      ...localFilters,
      propertyTypes: newTypes
    };
    setLocalFilters(newFilters);
    dispatch({ type: 'SET_FILTERS', payload: { propertyTypes: newTypes } });

    // Trigger search with updated property types
    const searchQuery = {
      location: searchParams.get('q') || searchParams.get('location') || newFilters.location || '',
      propertyType: newTypes.length > 0 ? newTypes[0] : '',
      minPrice: newFilters.rentRange?.min || '',
      maxPrice: newFilters.rentRange?.max || '',
      capacity: newFilters.capacity || '',
      amenities: newFilters.amenities || []
    };
    searchProperties(searchQuery);
  };

  const clearFilters = () => {
    const defaultFilters = {
      location: '',
      rentRange: { min: 0, max: 100000 },
      sizeRange: { min: 0, max: 10000 },
      propertyTypes: [],
      capacity: '',
      floorLevel: '',
      amenities: [],
      verified: false,
      availability: 'all'
    };
    setLocalFilters(defaultFilters);
    setSelectedPropertyTypes([]);
    dispatch({ type: 'SET_FILTERS', payload: defaultFilters });
  };

  const amenitiesList = [
    'WiFi', 'Parking', 'Security System', 'Elevator', 'Generator/Power Backup',
    'CCTV Surveillance', 'Air Conditioning', 'Reception/Front Desk', 'Conference Room',
    'Hospital Nearby', 'ATM Access', 'Market/Shopping Area', 'Petrol Pump',
    'Public Transport', 'Restaurant/Food Court', 'Fire Safety System', 'Handicap Accessible',
    'Loading Dock', 'Storage Space', 'Natural Light', 'Ventilation System',
    'Cafeteria', 'Cleaning Service', '24/7 Access', 'Maintenance Service',
    'Green Spaces/Terrace Access', 'Police Station Nearby', 'Bank Nearby', 
    'Gym/Fitness Center', 'Pharmacy', 'EV Charging Station'
  ];

  const propertyTypesList = [
    'Anyone (No Preferences)',
    'Retail',
    'Industrial',
    'Office Buildings',
    'F&B Spaces (Food & Beverage)',
    'Warehousing & Storage',
    'Wellness & Fitness Studios',
    'Training & Coaching Center',
    'Mixed-Use Commercial Floors',
    'Studio & Creative Spaces',
    'Diagnostic Centers',
    'Spas & Wellness Retreats',
    'Office & Corporate',
    'Healthcare & Medical',
    'Education & Training',
    'Fitness & Wellness',
    'Creative & Studios',
    'Technology & IT',
    'Manufacturing & Industrial',
    'Others/Custom'
  ];

  const toggleAmenity = (amenity) => {
    const currentAmenities = localFilters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    const newFilters = {
      ...localFilters,
      amenities: newAmenities
    };
    setLocalFilters(newFilters);
    dispatch({ type: 'SET_FILTERS', payload: { amenities: newAmenities } });

    // Trigger search with updated amenities
    const searchQuery = {
      location: searchParams.get('q') || searchParams.get('location') || newFilters.location || '',
      propertyType: searchParams.get('propertyType') || (Array.isArray(newFilters.propertyTypes) && newFilters.propertyTypes.length > 0 
        ? newFilters.propertyTypes[0] 
        : ''),
      minPrice: newFilters.rentRange?.min || '',
      maxPrice: newFilters.rentRange?.max || '',
      capacity: newFilters.capacity || '',
      amenities: newAmenities
    };
    searchProperties(searchQuery);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-6">
        {/* Rent Price Range Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Monthly Rent (₹)
          </label>
          <div className="space-y-3">
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={localFilters.rentRange?.min || 0}
                onChange={(e) => handleRangeChange('rentRange', 'min', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((localFilters.rentRange?.min || 0) / 100000) * 100}%, #e5e7eb ${((localFilters.rentRange?.min || 0) / 100000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={localFilters.rentRange?.max || 100000}
                onChange={(e) => handleRangeChange('rentRange', 'max', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                style={{
                  background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((localFilters.rentRange?.max || 100000) / 100000) * 100}%, #3b82f6 ${((localFilters.rentRange?.max || 100000) / 100000) * 100}%, #3b82f6 100%)`
                }}
              />
            </div>
            <div className="flex justify-between items-center text-sm gap-2">
              <input
                type="number"
                value={localFilters.rentRange?.min || 0}
                onChange={(e) => handleRangeChange('rentRange', 'min', e.target.value)}
                className="w-28 px-2 py-1 border border-gray-300 rounded text-center"
                placeholder="Min"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={localFilters.rentRange?.max || 100000}
                onChange={(e) => handleRangeChange('rentRange', 'max', e.target.value)}
                className="w-28 px-2 py-1 border border-gray-300 rounded text-center"
                placeholder="Max"
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              ₹{(localFilters.rentRange?.min || 0).toLocaleString()} - ₹{(localFilters.rentRange?.max || 100000).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Size Range Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Property Size (sq. ft.)
          </label>
          <div className="space-y-3">
            <div className="relative pt-1">
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={localFilters.sizeRange?.min || 0}
                onChange={(e) => handleRangeChange('sizeRange', 'min', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${((localFilters.sizeRange?.min || 0) / 10000) * 100}%, #e5e7eb ${((localFilters.sizeRange?.min || 0) / 10000) * 100}%, #e5e7eb 100%)`
                }}
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={localFilters.sizeRange?.max || 10000}
                onChange={(e) => handleRangeChange('sizeRange', 'max', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                style={{
                  background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${((localFilters.sizeRange?.max || 10000) / 10000) * 100}%, #10b981 ${((localFilters.sizeRange?.max || 10000) / 10000) * 100}%, #10b981 100%)`
                }}
              />
            </div>
            <div className="flex justify-between items-center text-sm gap-2">
              <input
                type="number"
                value={localFilters.sizeRange?.min || 0}
                onChange={(e) => handleRangeChange('sizeRange', 'min', e.target.value)}
                className="w-28 px-2 py-1 border border-gray-300 rounded text-center"
                placeholder="Min"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                value={localFilters.sizeRange?.max || 10000}
                onChange={(e) => handleRangeChange('sizeRange', 'max', e.target.value)}
                className="w-28 px-2 py-1 border border-gray-300 rounded text-center"
                placeholder="Max"
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              {(localFilters.sizeRange?.min || 0).toLocaleString()} - {(localFilters.sizeRange?.max || 10000).toLocaleString()} sq. ft.
            </div>
          </div>
        </div>

        {/* Property Type - Multi-select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Property Type (Multi-select)
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {propertyTypesList.map((type) => (
              <label key={type} className="flex items-center hover:bg-gray-50 p-1 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPropertyTypes.includes(type)}
                  onChange={() => togglePropertyType(type)}
                  className="mr-2 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className={`text-sm ${type === 'Anyone (No Preferences)' ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {type}
                </span>
              </label>
            ))}
          </div>
          {selectedPropertyTypes.length > 0 && (
            <div className="mt-2 text-xs text-primary-600 font-medium">
              ✓ {selectedPropertyTypes.length} type(s) selected
            </div>
          )}
        </div>

        {/* Verified Properties */}
        <div className="border border-gray-200 rounded-lg p-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.verified || false}
              onChange={(e) => handleFilterChange('verified', e.target.checked)}
              className="mr-3 text-primary-600 focus:ring-primary-500 rounded w-4 h-4"
            />
            <span className="text-sm font-medium text-gray-900">
              ✓ Show Only Verified Properties
            </span>
          </label>
        </div>

        {/* Availability Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Availability Status
          </label>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'All Properties' },
              { value: 'available', label: 'Available Now' },
              { value: 'under-construction', label: 'Under Construction' },
              { value: 'ready-to-move', label: 'Ready to Move' }
            ].map((status) => (
              <label key={status.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="radio"
                  name="availability"
                  value={status.value}
                  checked={localFilters.availability === status.value}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Capacity (People)
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['10', '25', '50', '100+'].map((cap) => (
              <button
                key={cap}
                onClick={() => handleFilterChange('capacity', cap === localFilters.capacity ? '' : cap)}
                className={`py-2 px-2 text-sm rounded-lg border transition-colors font-medium ${
                  localFilters.capacity === cap
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>

        {/* Floor Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Floor Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[{ key: 'ground', label: 'Ground' }, { key: 'upper', label: 'Upper' }, { key: 'top', label: 'Top' }].map((floor) => (
              <button
                key={floor.key}
                onClick={() => handleFilterChange('floorLevel', floor.key === localFilters.floorLevel ? '' : floor.key)}
                className={`py-2 px-3 text-sm rounded-lg border transition-colors font-medium ${
                  localFilters.floorLevel === floor.key
                    ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {floor.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Amenities
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {amenitiesList.map((amenity) => (
              <label key={amenity} className="flex items-center hover:bg-gray-50 p-1 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={(localFilters.amenities || []).includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="mr-2 text-primary-600 focus:ring-primary-500 rounded"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
          {(localFilters.amenities?.length || 0) > 0 && (
            <div className="mt-2 text-xs text-primary-600 font-medium">
              ✓ {localFilters.amenities.length} amenity(ies) selected
            </div>
          )}
        </div>
      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
        input[type="range"]:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        input[type="range"]:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default SearchFilters;


