import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProperty } from '../contexts/PropertyContext';
import AuthModal from '../components/Auth/AuthModal';
import SearchBar from '../components/Search/SearchBar';
import FeaturedProperties from '../components/Property/FeaturedProperties';

const Homepage = () => {
  const { isAuthenticated } = useAuth();
  const { properties, loading, fetchProperties } = useProperty();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState({
    isOpen: false,
    type: 'login'
  });
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleListProperty = () => {
    if (isAuthenticated) {
      navigate('/dashboard?tab=properties&action=add');
    } else {
      setAuthModal({ isOpen: true, type: 'login' });
    }
  };

  // Get featured properties (latest 6 properties)
  const featuredProperties = properties.slice(0, 6);

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, type: 'login' });
  };

  // Property types for quick navigation
  const propertyTypes = [
    { id: 'all', name: 'All Properties', icon: '🏢', count: properties.length },
    { id: 'office', name: 'Office Space', icon: '💼', count: properties.filter(p => p.propertyType === 'office').length },
    { id: 'shop', name: 'Retail Shops', icon: '🏪', count: properties.filter(p => p.propertyType === 'shop').length },
    { id: 'apartment', name: 'Co-working', icon: '👥', count: properties.filter(p => p.propertyType === 'apartment').length },
  ];

  // Quick stats
  const stats = [
    { label: 'Properties', value: '5,000+', icon: '🏢' },
    { label: 'Happy Clients', value: '10,000+', icon: '😊' },
    { label: 'Cities', value: '50+', icon: '🌆' },
    { label: 'Verified', value: '100%', icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Hero with Integrated Search */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 pt-4 pb-8 md:pt-6 md:pb-12">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
          {/* Compact Header */}
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              Find Your Perfect Space
            </h1>
            <p className="text-sm md:text-base text-indigo-100">
              Commercial properties across India
            </p>
          </div>

          {/* Integrated Search Bar */}
          <div className="max-w-4xl mx-auto">
            <SearchBar />
          </div>

          {/* Quick Stats - Compact */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-3xl mx-auto mt-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-2 md:p-3 text-center">
                <div className="text-lg md:text-2xl mb-1">{stat.icon}</div>
                <div className="text-xs md:text-sm font-bold text-white">{stat.value}</div>
                <div className="text-xs text-indigo-200 hidden md:block">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Type Quick Navigation */}
      <section className="bg-white py-4 border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-hide gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedPropertyType(type.id)}
                className={`flex-shrink-0 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  selectedPropertyType === type.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{type.icon}</span>
                <span className="hidden sm:inline">{type.name}</span>
                <span className="sm:hidden">{type.name.split(' ')[0]}</span>
                {type.count > 0 && (
                  <span className="ml-1 text-xs opacity-75">({type.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties - Compact Grid */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Section Header - Compact */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Featured Properties
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Handpicked spaces for your business
              </p>
            </div>
            <Link
              to="/search"
              className="text-sm md:text-base text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <FeaturedProperties properties={featuredProperties} loading={loading} />
        </div>
      </section>

      {/* Why Choose Us - Compact Icons */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 text-center">
            Why Choose ConnectSpace
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="font-semibold text-sm md:text-base text-gray-900">Verified Properties</h4>
              <p className="text-xs text-gray-600 mt-1">100% authentic listings</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-semibold text-sm md:text-base text-gray-900">Best Prices</h4>
              <p className="text-xs text-gray-600 mt-1">Competitive rates</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">🤝</div>
              <h4 className="font-semibold text-sm md:text-base text-gray-900">Expert Support</h4>
              <p className="text-xs text-gray-600 mt-1">24/7 assistance</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold text-sm md:text-base text-gray-900">Quick Process</h4>
              <p className="text-xs text-gray-600 mt-1">Fast bookings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Compact */}
      <section className="py-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              Our Services
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '📊', title: 'Analytics', desc: 'Track performance' },
              { icon: '🤖', title: 'AI Insights', desc: 'Smart recommendations' },
              { icon: '💳', title: 'Payments', desc: 'Secure transactions' },
              { icon: '📄', title: 'Legal Docs', desc: 'Agreement support' },
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-3xl mb-2">{service.icon}</div>
                <h4 className="font-semibold text-sm text-gray-900">{service.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compact CTA Banner */}
      <section className="py-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                Ready to Find Your Perfect Space?
              </h3>
              <p className="text-sm md:text-base text-indigo-100">
                Join thousands of businesses who found success with us
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/search"
                className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm md:text-base"
              >
                Browse Properties
              </Link>
              <button
                onClick={handleListProperty}
                className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors text-sm md:text-base"
              >
                List Property
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Compact Slider */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 text-center">
            What Our Clients Say
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Rajesh Kumar', role: 'Business Owner', rating: 5, text: 'Found the perfect office space in just 2 days!' },
              { name: 'Priya Sharma', role: 'Retail Manager', rating: 5, text: 'Excellent service and verified properties.' },
              { name: 'Amit Patel', role: 'Startup Founder', rating: 5, text: 'Best platform for commercial real estate.' },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-3">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-6 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 text-center">
          <p className="text-sm md:text-base mb-2">
            Have questions? We're here to help!
          </p>
          <div className="flex items-center justify-center gap-4 text-xs md:text-sm">
            <a href="tel:+911234567890" className="hover:text-indigo-400">📞 Call Us</a>
            <span>•</span>
            <a href="mailto:support@connectspace.com" className="hover:text-indigo-400">✉️ Email</a>
            <span>•</span>
            <Link to="/support" className="hover:text-indigo-400">💬 Chat</Link>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.type}
        onClose={closeAuthModal}
        onSuccess={() => {
          navigate('/dashboard?tab=properties&action=add');
        }}
      />
    </div>
  );
};

export default Homepage;