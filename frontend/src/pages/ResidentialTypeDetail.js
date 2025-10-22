import React from 'react';
import { useParams } from 'react-router-dom';

const residentialTypeDetails = {
  'single-family': {
    title: 'Single-Family Homes',
    description: 'Standalone structures designed for one family, offering maximum privacy and freedom.',
    features: [
      'Complete privacy with no shared walls',
      'Full control over property maintenance and modifications',
      'Private yard and outdoor space',
      'Typically larger square footage',
      'Customizable interior and exterior',
      'Often located in suburban areas'
    ],
    advantages: [
      'Maximum privacy and independence',
      'Complete control over property',
      'Potential for expansion',
      'Usually appreciates in value',
      'Ideal for families with children'
    ],
    considerations: [
      'Higher maintenance responsibility',
      'More expensive than other options',
      'Property taxes and insurance costs',
      'Yard maintenance required',
      'Location may require commuting'
    ]
  },
  'apartments': {
    title: 'Apartments (Flats)',
    description: 'Units within a larger building, offering convenience and community living.',
    features: [
      'Shared building amenities',
      'Professional maintenance services',
      'Security features',
      'Often in prime urban locations',
      'Range of sizes available',
      'Community environment'
    ],
    advantages: [
      'Lower maintenance responsibility',
      'Often more affordable',
      'Prime locations available',
      'Built-in community',
      'Professional management'
    ],
    considerations: [
      'Less privacy than houses',
      'Limited modification options',
      'Potential noise from neighbors',
      'Monthly maintenance fees',
      'Parking may be limited'
    ]
  },
  // Add similar detailed information for other property types
};

const ResidentialTypeDetail = () => {
  const { type } = useParams();
  const details = residentialTypeDetails[type] || {};

  if (!details.title) {
    return <div>Property type not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{details.title}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-lg text-gray-700 mb-6">{details.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Key Features */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-2">
              {details.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advantages */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Advantages</h2>
            <ul className="space-y-2">
              {details.advantages.map((advantage, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-600">{advantage}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Considerations */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Considerations</h2>
            <ul className="space-y-2">
              {details.considerations.map((consideration, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 mr-2">!</span>
                  <span className="text-gray-600">{consideration}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentialTypeDetail;