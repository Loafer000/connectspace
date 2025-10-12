import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProperty } from '../contexts/PropertyContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ImageGallery from '../components/Property/ImageGallery';
import PropertyInfo from '../components/Property/PropertyInfo';
import ContactLandlord from '../components/Property/ContactLandlord';
import PropertyBooking from '../components/Property/PropertyBooking';
import Reviews from '../components/Property/Reviews';
import MapView from '../components/Map/MapView';
import AuthModal from '../components/Auth/AuthModal';
import toast from 'react-hot-toast';
import { bookingAPI } from '../services/api';

const PropertyDetails = () => {
  const { id } = useParams();
  const { currentProperty, loading, getPropertyById } = useProperty();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (id) {
      getPropertyById(id);
    }
  }, [id, getPropertyById]);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    toast.success(
      isFavorite ? 'Removed from favorites' : 'Added to favorites'
    );
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentProperty?.title,
        text: `Check out this property: ${currentProperty?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleBookProperty = (bookingType = 'booking') => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setShowBookingModal(bookingType);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      toast.success('Booking request submitted successfully!');
      setShowBookingModal(false);
      
      // Integrate with backend API
      const bookingPayload = {
        propertyId: id,
        bookingType: bookingData.bookingType || 'inquiry',
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        message: bookingData.message,
        moveInDate: bookingData.moveInDate,
        leaseDuration: bookingData.leaseDuration,
        visitDate: bookingData.visitDate,
        visitTime: bookingData.visitTime,
        specialRequests: bookingData.specialRequests
      };

      const response = await bookingAPI.createBooking(bookingPayload);
      if (response.success) {
        toast.success(response.message);
      } else {
        throw new Error(response.message || 'Failed to submit booking');
      }
    } catch (error) {
      toast.error('Failed to submit booking request');
      console.error('Booking error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!currentProperty || !currentProperty._id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center animate-fade-in max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🏠</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Property Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The property you're looking for doesn't exist, has been removed, or is pending verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              ← Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              🏠 Go Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Refresh Page
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-8">
            If this problem persists, please contact support or try again later.
          </p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('🏠 PropertyDetails - Current Property:', currentProperty);
  console.log('🖼️ PropertyDetails - Images:', currentProperty.images);
  console.log('🏷️ PropertyDetails - Amenities:', currentProperty.amenities);

  // Handle amenities being either an array or object with categories
  const flattenedAmenities = Array.isArray(currentProperty.amenities)
    ? currentProperty.amenities
    : (currentProperty.amenities && typeof currentProperty.amenities === 'object')
      ? Object.values(currentProperty.amenities).flat()
      : [];

  // Ensure required data exists with safe defaults
  const safeProperty = {
    ...currentProperty,
    images: Array.isArray(currentProperty.images) && currentProperty.images.length > 0 
      ? currentProperty.images 
      : ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
    amenities: flattenedAmenities,
    price: currentProperty.price || currentProperty.rental?.monthlyRent || 0,
    location: currentProperty.location || currentProperty.address?.city || 'Location not specified',
    propertyType: currentProperty.propertyType || 'Property',
    title: currentProperty.title || 'Property Details'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-semibold rounded-lg mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                {safeProperty.propertyType}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {safeProperty.title}
              </h1>
              <p className="text-lg text-gray-600 flex items-center mb-4">
                <svg className="w-5 h-5 mr-2 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {safeProperty.location}
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-2xl font-bold rounded-xl">
                ₹{safeProperty.price?.toLocaleString()}<span className="text-base font-normal">/month</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleFavoriteToggle}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                title="Share property"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="animate-fade-in animation-delay-100">
              <ImageGallery images={safeProperty.images} />
            </div>

            {/* Property Information */}
            <div className="animate-fade-in animation-delay-200">
              <PropertyInfo property={safeProperty} />
            </div>

            {/* Map */}
            <div className="card animate-fade-in animation-delay-300">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Location
                </h3>
              </div>
              <div className="h-64">
                <MapView 
                  properties={[safeProperty]} 
                  center={currentProperty.coordinates || currentProperty.location?.coordinates}
                  zoom={15}
                />
              </div>
            </div>

            {/* Reviews */}
            <div className="animate-fade-in animation-delay-400">
              <Reviews reviews={currentProperty.reviews || []} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price & Contact */}
              <div className="card animate-fade-in animation-delay-200">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    ₹{safeProperty.price}
                    <span className="text-lg font-normal text-gray-600">/month</span>
                  </div>
                </div>
                <ContactLandlord landlord={currentProperty.landlord || {}} />
                
                {/* Booking Actions */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => handleBookProperty('booking')}
                    className="btn btn-primary w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Book This Property
                  </button>
                  <button
                    onClick={() => handleBookProperty('visit')}
                    className="btn btn-outline w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Schedule Visit
                  </button>
                  <button
                    onClick={() => handleBookProperty('inquiry')}
                    className="btn btn-secondary w-full"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Send Inquiry
                  </button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="card animate-fade-in animation-delay-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Property Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type</span>
                    <span className="badge badge-secondary">{safeProperty.propertyType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Floors</span>
                    <span className="font-medium text-gray-900">{currentProperty.floors || currentProperty.specifications?.floor?.total || 1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Parking Spaces</span>
                    <span className="font-medium text-gray-900">{currentProperty.parkingSpaces || (currentProperty.specifications?.parking?.twoWheeler + currentProperty.specifications?.parking?.fourWheeler) || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Area</span>
                    <span className="font-medium text-gray-900">{currentProperty.area || currentProperty.specifications?.area?.carpet || 1000} sq ft</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {safeProperty.amenities && safeProperty.amenities.length > 0 && (
                <div className="card animate-fade-in animation-delay-400">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {safeProperty.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-teal-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {typeof amenity === 'string' ? amenity : amenity?.name || amenity?.type || 'Amenity'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <PropertyBooking
          property={safeProperty}
          initialTab={typeof showBookingModal === 'string' ? showBookingModal : 'inquiry'}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          initialMode="login"
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            setShowBookingModal(true);
          }}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
