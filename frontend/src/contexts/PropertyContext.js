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
      console.log('🔍 PropertyContext: Searching properties with params:', searchParams);
      
      // Build query parameters for backend search API
      const queryParams = {};
      
      // Use location for text search (searches city, area, address, etc.)
      if (searchParams.location) {
        queryParams.q = searchParams.location;  // General text search across all fields
        queryParams.city = searchParams.location; // Also search by city specifically
        console.log('🎯 Search term (q):', queryParams.q);
      } else {
        console.log('⚠️ No location provided in search params');
      }
      
      // Handle property type
      if (searchParams.propertyType && searchParams.propertyType !== 'all') {
        queryParams.propertyType = searchParams.propertyType;
        console.log('🏢 Property type filter:', queryParams.propertyType);
      }

      // Handle price range
      if (searchParams.minPrice || searchParams.rentRange?.min) {
        queryParams.minRent = parseInt(searchParams.minPrice || searchParams.rentRange?.min);
      }
      if (searchParams.maxPrice || searchParams.rentRange?.max) {
        queryParams.maxRent = parseInt(searchParams.maxPrice || searchParams.rentRange?.max);
      }

      // Handle capacity and bedrooms
      if (searchParams.capacity) {
        queryParams.capacity = searchParams.capacity;
      }
      if (searchParams.bedrooms) {
        queryParams.bedrooms = searchParams.bedrooms;
      }

      // Handle amenities
      if (searchParams.amenities && searchParams.amenities.length > 0) {
        queryParams.amenities = searchParams.amenities.join(',');
      }

      console.log('📡 PropertyContext: Sending search request to API:', queryParams);
      console.log('📋 QueryParams details:', JSON.stringify(queryParams, null, 2));
      console.log('🔑 QueryParams.q =', queryParams.q, '(type:', typeof queryParams.q, ')');

      // Call backend search API
      const response = await propertyAPI.searchProperties(queryParams);
      
      console.log('📥 PropertyContext: API Response:', response);
      
      if (response.success) {
        console.log(`✅ PropertyContext: Found ${response.data.properties.length} properties`);
        console.log('📦 PropertyContext: First 3 properties:', response.data.properties.slice(0, 3).map(p => ({
          title: p.title,
          city: p.address?.city,
          id: p._id
        })));
        
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.data.properties });
      } else {
        throw new Error(response.message || 'Failed to search properties');
      }
    } catch (error) {
      console.error('❌ PropertyContext: Search properties error:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      
      // Return empty results when API fails
      dispatch({ 
        type: 'SET_SEARCH_RESULTS', 
        payload: [] 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const getPropertyById = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log(`🔍 Fetching property by ID: ${id}`);
      
      // Try backend API first
      const response = await propertyAPI.getProperty(id);
      
      console.log('📡 Property response:', response);
      
      if (response.success && response.data?.property) {
        console.log('✅ Property loaded successfully');
        dispatch({ type: 'SET_PROPERTY', payload: response.data.property });
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        throw new Error(response.message || 'Property not found');
      }
    } catch (error) {
      console.error('❌ Get property error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Property not found' });
      dispatch({ type: 'SET_PROPERTY', payload: null }); // Clear current property
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addProperty = useCallback(async (propertyData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('🏠 Frontend: Adding property with data:', propertyData);

      // Transform frontend data to match backend schema
      console.log('🔄 Transforming property data...');
      console.log('📝 usagePreferences:', propertyData.usagePreferences);
      console.log('🏢 propertyType from form:', propertyData.propertyType);
      
      // Use propertyType from form, or fallback to mapping from usage preferences
      let propertyType = propertyData.propertyType || 'office'; // Use what user selected!
      
      // If user didn't select a property type, try to guess from usage preferences
      if (!propertyData.propertyType && propertyData.usagePreferences && propertyData.usagePreferences.length > 0) {
        const firstPref = propertyData.usagePreferences[0].toLowerCase();
        if (firstPref.includes('retail')) propertyType = 'shop';
        else if (firstPref.includes('industrial') || firstPref.includes('warehouse')) propertyType = 'office';
        else if (firstPref.includes('office')) propertyType = 'office';
        else propertyType = 'office';
        console.log('⚠️ No propertyType selected, guessed from preferences:', propertyType);
      }
      
      console.log('✅ Final propertyType:', propertyType);
      
      const backendData = {
        title: propertyData.title,
        description: propertyData.description,
        propertyType: propertyType,
        usagePreferences: propertyData.usagePreferences || ['Anyone (No Preferences)'], // NEW: Store usage preferences
        category: propertyData.category || 'commercial',
        address: {
          street: propertyData.address || 'Not specified',
          area: propertyData.area || 'Not specified', // NOW using actual area from form
          city: propertyData.city,
          state: propertyData.state || 'Maharashtra', // NOW using actual state from form
          pincode: propertyData.pincode,
          country: 'India',
          landmark: propertyData.landmark || '' // NOW using actual landmark from form
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
        images: propertyData.images?.map(img => {
          if (typeof img === 'string') {
            return { url: img, isPrimary: false };
          } else if (img.url) {
            return {
              url: img.url,
              publicId: img.publicId,
              isPrimary: false,
              category: 'other'
            };
          }
          return null;
        }).filter(Boolean) || [],
        documents: propertyData.documents?.map(doc => ({
          name: doc.name,
          url: doc.url,
          publicId: doc.publicId,
          type: 'other' // Can be: 'ownership-proof', 'noc', 'floor-plan', 'other'
        })) || [],
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
      
      // Log the full error response for debugging
      if (error.response?.data) {
        console.error('❌ Backend validation errors:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Extract meaningful error message
      let errorMessage = 'Failed to create property';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // If there are specific validation errors, show them
      if (error.response?.data?.errors) {
        const validationMessages = error.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `Validation failed: ${validationMessages}`;
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
      const errorMessage = error?.message || error?.toString() || 'Failed to fetch properties';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
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

