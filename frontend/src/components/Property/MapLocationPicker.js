import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom draggable marker component
function DraggableMarker({ position, onPositionChange }) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        onPositionChange(newPos);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

const MapLocationPicker = ({ initialLat = 28.6139, initialLng = 77.2090, onLocationSelect }) => {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reverse geocode to get address when position changes
    const fetchAddress = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position[0]}&lon=${position[1]}&format=json`
        );
        const data = await response.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
        console.error('Error fetching address:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [position]);

  const handlePositionChange = (newPos) => {
    const newPosition = [newPos.lat, newPos.lng];
    setPosition(newPosition);
    if (onLocationSelect) {
      onLocationSelect({
        latitude: newPos.lat,
        longitude: newPos.lng,
        address: address
      });
    }
  };

  const handleMapClick = (latlng) => {
    handlePositionChange(latlng);
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPosition);
          if (onLocationSelect) {
            onLocationSelect({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              address: address
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please select manually on the map.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          📍 Drag the marker or click on the map to set the precise location
        </p>
        <button
          type="button"
          onClick={getUserLocation}
          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use My Location
        </button>
      </div>

      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker position={position} onPositionChange={handlePositionChange} />
          <MapClickHandler onLocationSelect={handleMapClick} />
        </MapContainer>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-1">Selected Location:</p>
            {loading ? (
              <p className="text-sm text-gray-600">Loading address...</p>
            ) : (
              <p className="text-sm text-gray-800">{address || 'Click on the map to select a location'}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
