import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PricingPage = () => {
  const { isAuthenticated } = useAuth();
  const [selectedRole, setSelectedRole] = useState('landlord'); // 'landlord' or 'tenant'

  const landlordPlans = [
    {
      name: 'Basic',
      price: 699,
      duration: '45 days',
      features: [
        '1 property listing',
        '10 contact reveals',
        'Listing on website/app',
        'Limited photos',
        'Owner dashboard',
        'Chat/call features with privacy',
        'Basic analytics'
      ],
      highlight: false,
      idealFor: 'First-time sellers',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Standard',
      price: 1299,
      duration: '90 days',
      features: [
        '3 property listings',
        '25 contact reveals',
        'Premium listing slot',
        'Basic verification',
        'WhatsApp alerts',
        'Priority visibility',
        'Owner dashboard',
        'Chat/call features',
        'Analytics dashboard'
      ],
      highlight: true,
      badge: 'Popular',
      idealFor: 'Repeat/multi-property owners',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Premium',
      price: 1999,
      duration: '180 days',
      features: [
        '5 property listings',
        '45 contact reveals',
        'Featured/top listing',
        'Relationship manager support',
        'Professional photos',
        'Documentation help',
        'Verified badges',
        'Legal documentation assistance',
        'Full analytics & insights'
      ],
      highlight: false,
      idealFor: 'Portfolio owners',
      color: 'from-blue-600 to-blue-700'
    }
  ];

  const tenantPlans = [
    {
      name: 'Basic Connect',
      price: 499,
      duration: '30 days',
      features: [
        '10 owner contacts',
        'Property alerts',
        'Listing filters',
        'Direct owner contact unlocks',
        'Basic search features'
      ],
      highlight: false,
      idealFor: 'Budget tenants',
      color: 'from-blue-400 to-blue-500'
    },
    {
      name: 'Comfort',
      price: 999,
      duration: '60 days',
      features: [
        '25 owner contacts',
        'Dedicated relationship manager',
        'Instant alerts',
        'New property listing priority',
        'Early access to listings',
        'Privacy protection'
      ],
      highlight: true,
      badge: 'Popular',
      idealFor: 'Active searchers',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Assure/Relax',
      price: 1499,
      priceRange: '₹1499-1999',
      duration: '90 days',
      features: [
        '50 owner contacts',
        'Documentation assistance',
        'Money-back guarantee',
        'Verification of owners/properties',
        'Rental agreement drafting',
        'Move-in support',
        'Priority support'
      ],
      highlight: false,
      idealFor: 'Serious movers',
      color: 'from-blue-600 to-blue-700'
    }
  ];

  const addOns = [
    {
      icon: '🛡️',
      title: 'Insurance',
      landlord: "Property damage/liability cover",
      tenant: "Renter's insurance protection"
    },
    {
      icon: '🏡',
      title: 'Smart Home Boost',
      landlord: 'Premium visibility for smart homes',
      tenant: 'Access to smart/wellness-enabled properties'
    },
    {
      icon: '🔍',
      title: 'Background Check',
      landlord: 'Tenant background verification',
      tenant: 'Verified tenant score & references'
    },
    {
      icon: '📢',
      title: 'Marketing Boost',
      landlord: 'Social media & Google/Facebook ads',
      tenant: 'Featured tenant profile'
    },
    {
      icon: '💳',
      title: 'Online Rent Collection',
      landlord: 'Enable rent payments via platform',
      tenant: 'Secure online rent payment options'
    }
  ];

  const currentPlans = selectedRole === 'landlord' ? landlordPlans : tenantPlans;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            🏠 Premium Plans for Landlords & Tenants
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan to list your properties or find your dream home
          </p>
          
          {/* Role Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-lg rounded-full p-1 inline-flex">
              <button
                onClick={() => setSelectedRole('landlord')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedRole === 'landlord'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🔑 Landlord Plans
              </button>
              <button
                onClick={() => setSelectedRole('tenant')}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                  selectedRole === 'tenant'
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🧳 Tenant Plans
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {currentPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 ${
                plan.highlight ? 'ring-4 ring-indigo-500 shadow-2xl' : ''
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-r ${plan.color} text-white p-8 text-center`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold">
                    {plan.priceRange || `₹${plan.price}`}
                  </span>
                </div>
                <p className="text-blue-100">{plan.duration}</p>
              </div>

              {/* Features */}
              <div className="p-8">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Ideal for:</p>
                  <p className="text-indigo-600 font-semibold">{plan.idealFor}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className={`w-full bg-gradient-to-r ${plan.color} text-white py-4 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300`}>
                  Choose {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">🧩 Optional Add-ons</h2>
          <p className="text-center text-gray-600 mb-12">
            Enhance your experience with these premium features
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {addOns.map((addon, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-4xl mb-4">{addon.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{addon.title}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Landlord:</span> {addon.landlord}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Tenant:</span> {addon.tenant}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl shadow-xl p-12">
          <h2 className="text-3xl font-bold text-center mb-12">
            {selectedRole === 'landlord' ? '🔑 Landlord Plans' : '🧳 Tenant Plans'} Comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 text-gray-700">Feature</th>
                  {currentPlans.map((plan, idx) => (
                    <th key={idx} className="text-center py-4 px-6">
                      <div className="font-bold text-gray-900">{plan.name}</div>
                      <div className="text-sm text-gray-600">{plan.priceRange || `₹${plan.price}`}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedRole === 'landlord' ? (
                  <>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Property Listings</td>
                      <td className="text-center py-4 px-6">1</td>
                      <td className="text-center py-4 px-6">3</td>
                      <td className="text-center py-4 px-6">5</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Contact Reveals</td>
                      <td className="text-center py-4 px-6">10</td>
                      <td className="text-center py-4 px-6">25</td>
                      <td className="text-center py-4 px-6">45</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Relationship Manager</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">✅</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Professional Photos</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">✅</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Legal Documentation</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">✅</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Owner Contacts</td>
                      <td className="text-center py-4 px-6">10</td>
                      <td className="text-center py-4 px-6">25</td>
                      <td className="text-center py-4 px-6">50</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Relationship Manager</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">✅</td>
                      <td className="text-center py-4 px-6">✅</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Money-back Guarantee</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">✅</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Documentation Assistance</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">✅</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-6 text-gray-700">Move-in Support</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">❌</td>
                      <td className="text-center py-4 px-6">✅</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied landlords and tenants
            </p>
            {isAuthenticated ? (
              <Link to="/dashboard" className="inline-block bg-white text-blue-600 px-12 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/" className="inline-block bg-white text-blue-600 px-12 py-4 rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                Sign Up Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

