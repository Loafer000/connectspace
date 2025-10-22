import React from 'react';
import { Link } from 'react-router-dom';

const residentialTypes = [
  {
    id: 'single-family',
    title: 'Single-Family Homes (Private Villas)',
    icon: '🏡',
    description: 'Standalone structures for one family. Offers privacy, outdoor space, and customization. Common in suburban and rural areas.',
    features: ['Private outdoor space', 'Full customization', 'No shared walls', 'Ideal for families']
  },
  {
    id: 'apartments',
    title: 'Apartments (Flats)',
    icon: '🏢',
    description: 'Units within a multi-story building. Shared amenities like elevators, parking, and security. Popular in urban areas for affordability and convenience.',
    features: ['Shared amenities', 'Lower maintenance', 'Security features', 'Urban locations']
  },
  {
    id: 'townhouses',
    title: 'Townhouses',
    icon: '🏘️',
    description: 'Multi-floor homes sharing side walls with neighbors. Blend of apartment and single-family home features. Often part of gated communities.',
    features: ['Multiple floors', 'Private entrance', 'Community amenities', 'Space efficiency']
  },
  {
    id: 'condos',
    title: 'Condominiums (Condos)',
    icon: '🏢',
    description: 'Privately owned units within a shared building. Owners share responsibility for common areas. Ideal for urban professionals.',
    features: ['Private ownership', 'Shared maintenance', 'Urban lifestyle', 'Investment potential']
  },
  {
    id: 'duplexes',
    title: 'Duplexes and Triplexes',
    icon: '🏠',
    description: 'Two or three units in one building, often stacked or side-by-side. Can be owner-occupied with rental potential.',
    features: ['Rental income potential', 'Shared structure', 'Cost-effective', 'Multiple units']
  },
  {
    id: 'bungalows',
    title: 'Bungalows',
    icon: '🏡',
    description: 'Single-story homes, often with a porch. Common in older neighborhoods and retirement communities.',
    features: ['Single story', 'Front porch', 'Easy accessibility', 'Traditional charm']
  },
  {
    id: 'studio',
    title: 'Studio Apartments',
    icon: '🏢',
    description: 'Compact units with combined living, sleeping, and kitchen space. Suited for singles or short-term stays.',
    features: ['Space efficiency', 'Affordable', 'Low maintenance', 'Urban living']
  },
  {
    id: 'mobile',
    title: 'Mobile Homes',
    icon: '🏠',
    description: 'Prefabricated homes that can be relocated. Cost-effective housing option, often in designated parks.',
    features: ['Relocatable', 'Affordable', 'Community living', 'Low maintenance']
  },
  {
    id: 'farmhouses',
    title: 'Farmhouses',
    icon: '🏡',
    description: 'Residences in rural settings, often part of agricultural land. Spacious and typically surrounded by nature.',
    features: ['Rural setting', 'Large plots', 'Natural surroundings', 'Traditional design']
  },
  {
    id: 'row-houses',
    title: 'Row Houses',
    icon: '🏘️',
    description: 'Uniform houses in a row, sharing side walls. Common in planned urban developments.',
    features: ['Urban setting', 'Uniform design', 'Shared walls', 'Community feel']
  }
];

const ResidentialSpace = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Residential Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {residentialTypes.map((type) => (
          <Link 
            key={type.id} 
            to={`/residential/${type.id}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">{type.icon}</span>
              <h3 className="text-xl font-semibold text-gray-900">{type.title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{type.description}</p>
            <div className="grid grid-cols-2 gap-2">
              {type.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">•</span>
                  {feature}
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResidentialSpace;