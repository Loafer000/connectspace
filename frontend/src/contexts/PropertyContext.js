import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { propertyAPI } from '../services/api';

const PropertyContext = createContext();

const propertyReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROPERTIES':
      return {
        ...state,
        properties: action.payload,
        loading: false
      };
    case 'SET_PROPERTY':
      return {
        ...state,
        currentProperty: action.payload,
        loading: false
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.payload)
      };
    case 'ADD_PROPERTY':
      return {
        ...state,
        properties: [...state.properties, action.payload],
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  properties: [],
  currentProperty: null,
  searchResults: [],
  favorites: [],
  filters: {
    location: '',
    priceRange: { min: 0, max: 10000 },
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    amenities: []
  },
  loading: false,
  error: null
};

// Production-ready context - no mock data

export const PropertyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(propertyReducer, initialState);

  const searchProperties = useCallback(async (searchParams) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Build query parameters for backend search API
      const queryParams = {};
      
      // Use location as both city filter and general search query
      if (searchParams.location) {
        queryParams.city = searchParams.location;  // For city-specific search
        queryParams.q = searchParams.location;     // For general text search
      }
      
      if (searchParams.propertyType) queryParams.propertyType = searchParams.propertyType;
      if (searchParams.minPrice) queryParams.minRent = searchParams.minPrice;
      if (searchParams.maxPrice) queryParams.maxRent = searchParams.maxPrice;
      if (searchParams.bedrooms) queryParams.bedrooms = searchParams.bedrooms;
      if (searchParams.capacity) queryParams.bedrooms = searchParams.capacity;

      // Call backend search API
      const response = await propertyAPI.searchProperties(queryParams);
      
      if (response.success) {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.data.properties });
      } else {
        throw new Error(response.message || 'Failed to search properties');
      }
    } catch (error) {
      console.error('Search properties error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Fallback to empty results for production - no mock data
      console.warn('API search failed, using empty results. Ensure backend is running.');
      
      // Return empty results when API fails
      dispatch({ 
        type: 'SET_SEARCH_RESULTS', 
        payload: [] 
      });
    }
  }, []);

  const getPropertyById = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Try backend API first
      const response = await propertyAPI.getProperty(id);
      if (response.success) {
        dispatch({ type: 'SET_PROPERTY', payload: response.data.property });
      } else {
        throw new Error(response.message || 'Property not found');
      }
    } catch (error) {
      console.error('Get property error:', error);
      // No fallback data for production
      dispatch({ type: 'SET_ERROR', payload: 'Property not found' });
    }
  }, []);

  const addProperty = useCallback(async (propertyData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🏠 Frontend: Adding property with data:', propertyData);

      // Transform frontend data to match backend schema
      const backendData = {
        title: propertyData.title,
        description: propertyData.description,
        propertyType: propertyData.propertyType || 'office',
        category: propertyData.category || 'commercial',
        address: {
          street: propertyData.address || 'Not specified',
          area: propertyData.city || 'Not specified', // Use city as area since we don't collect area separately
          city: propertyData.city,
          state: propertyData.state || 'Maharashtra',
          pincode: propertyData.pincode,
          country: 'India',
          landmark: propertyData.landmark || ''
        },
        location: {
          type: 'Point',
          coordinates: [72.8777, 19.0760] // Default Mumbai coordinates [longitude, latitude]
        },
        specifications: {
          bedrooms: parseInt(propertyData.bedrooms) || 0,
          bathrooms: parseInt(propertyData.bathrooms) || 1,
          area: {
            carpet: parseInt(propertyData.area) || 1000, // This is the property size in sq ft
            builtUp: parseInt(propertyData.area) || 1000,
            unit: 'sqft'
          },
          floor: {
            current: parseInt(propertyData.floor) || 1,
            total: parseInt(propertyData.totalFloors) || parseInt(propertyData.floor) || 1
          },
          parking: {
            twoWheeler: 1,
            fourWheeler: 1
          }
        },
        rental: {
          monthlyRent: parseInt(propertyData.price) || 10000,
          securityDeposit: parseInt(propertyData.securityDeposit) || parseInt(propertyData.price) * 2 || 20000,
          maintenanceCharges: {
            amount: parseInt(propertyData.maintenanceCharges) || 2000,
            included: propertyData.utilitiesIncluded || false
          },
          leaseDuration: {
            minimum: 11, // 11 months minimum
            unit: 'months'
          },
          availableFrom: new Date().toISOString(),
          negotiable: true
        },
        amenities: {
          basic: propertyData.amenities?.filter(a => ['furnished', 'air-conditioning', 'wifi', 'power-backup', 'lift'].includes(a)) || ['wifi'],
          safety: propertyData.amenities?.filter(a => ['24x7-security', 'cctv', 'gated-community'].includes(a)) || ['24x7-security'],
          utilities: ['water-supply', 'electricity', 'internet-ready']
        },
        images: propertyData.images?.map(img => typeof img === 'string' ? img : img.url).filter(Boolean) || [],
        visibility: 'public',
        status: 'available'
      };

      console.log('📝 Transformed data for backend:', backendData);

      // Call the actual backend API
      const response = await propertyAPI.createProperty(backendData);
      
      if (response.success) {
        console.log('✅ Property created successfully:', response.data);
        dispatch({ type: 'ADD_PROPERTY', payload: response.data.property });
        dispatch({ type: 'SET_LOADING', payload: false });
        return { success: true, property: response.data.property };
      } else {
        throw new Error(response.message || 'Failed to create property');
      }
    } catch (error) {
      console.error('❌ Frontend addProperty error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data || 'No response data'
      });
      
      // Extract meaningful error message
      let errorMessage = 'Failed to create property';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: errorMessage };
    }
  }, []);

  const toggleFavorite = useCallback((propertyId) => {
    if (state.favorites.includes(propertyId)) {
      dispatch({ type: 'REMOVE_FAVORITE', payload: propertyId });
    } else {
      dispatch({ type: 'ADD_FAVORITE', payload: propertyId });
    }
  }, [state.favorites]);

  const fetchProperties = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🔍 Fetching all properties from backend...');
      const response = await propertyAPI.getProperties(); // Fixed method name
      console.log('📊 Properties response:', response);
      
      if (response.success) {
        console.log(`✅ Found ${response.data.properties.length} properties`);
        dispatch({ type: 'SET_PROPERTIES', payload: response.data.properties });
      } else {
        throw new Error(response.message || 'Failed to fetch properties');
      }
    } catch (error) {
      console.error('❌ Fetch properties error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      // Set empty array as fallback
      dispatch({ type: 'SET_PROPERTIES', payload: [] });
    }
  }, []);

  const setFilters = useCallback((newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  }, []);

  const value = {
    ...state,
    searchProperties,
    getPropertyById,
    addProperty,
    fetchProperties,
    toggleFavorite,
    setFilters
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

export default PropertyContext;