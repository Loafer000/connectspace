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
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' });

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

  const featuredProperties = properties.slice(0, 6);
  const closeAuthModal = () => setAuthModal({ isOpen: false, type: 'login' });

  // Stats
  const stats = [
    { label: 'Properties', value: '10,000+', icon: '🏢', color: 'from-blue-400 to-blue-500' },
    { label: 'Happy Clients', value: '25,000+', icon: '😊', color: 'from-blue-500 to-blue-600' },
    { label: 'Cities', value: '100+', icon: '🌆', color: 'from-blue-300 to-blue-400' },
    { label: 'Success Rate', value: '98%', icon: '✨', color: 'from-blue-600 to-blue-700' },
  ];

  // Property types
  const propertyTypes = [
    { id: 'office', name: 'Office Space', icon: '💼', count: 450, color: 'bg-blue-50 border-blue-200' },
    { id: 'retail', name: 'Retail Shop', icon: '🏪', count: 300, color: 'bg-blue-100 border-blue-300' },
    { id: 'warehouse', name: 'Warehouse', icon: '📦', count: 150, color: 'bg-blue-50 border-blue-200' },
    { id: 'coworking', name: 'Co-working', icon: '🤝', count: 100, color: 'bg-blue-100 border-blue-300' },
  ];

  // Features
  const features = [
    {
      icon: '🔍',
      title: 'Smart Search',
      description: 'Find your perfect space with AI-powered recommendations',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '🔒',
      title: 'Verified Listings',
      description: '100% authenticated properties with detailed verification',
      color: 'from-blue-600 to-blue-700'
    },
    {
      icon: '💳',
      title: 'Secure Payments',
      description: 'Safe and encrypted payment processing',
      color: 'from-blue-400 to-blue-500'
    },
    {
      icon: '🤝',
      title: '24/7 Support',
      description: 'Expert assistance whenever you need it',
      color: 'from-blue-500 to-blue-600'
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Business Owner',
      image: 'https://ui-avatars.com/api/?name=Rajesh+Kumar&background=14b8a6&color=fff',
      rating: 5,
      text: 'Found the perfect office space in just 2 days! The process was smooth and transparent.'
    },
    {
      name: 'Priya Sharma',
      role: 'Retail Manager',
      image: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=6366f1&color=fff',
      rating: 5,
      text: 'Excellent platform with verified properties. Highly recommended for commercial spaces!'
    },
    {
      name: 'Amit Patel',
      role: 'Startup Founder',
      image: 'https://ui-avatars.com/api/?name=Amit+Patel&background=fb923c&color=fff',
      rating: 5,
      text: 'Best platform for finding co-working spaces. Great support team and easy booking.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Modern & Clean */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span>India's Leading Commercial Real Estate Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up">
              Find Your Perfect
              <span className="block mt-2 text-white">
                Commercial Space
              </span>
            </h1>

            <p className="text-lg md:text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
              Discover verified properties across India. Office spaces, retail shops, warehouses, and co-working spaces at your fingertips.
            </p>

            {/* Search Bar */}
            <div className="mb-8">
              <SearchBar />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/search" className="btn btn-secondary btn-lg bg-white text-blue-600 hover:bg-gray-50">
                <span>🔍</span>
                <span>Browse Properties</span>
              </Link>
              <button onClick={handleListProperty} className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-blue-600">
                <span>➕</span>
                <span>List Your Property</span>
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-teal-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types - Quick Navigation */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Type</h2>
            <Link to="/search" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyTypes.map((type) => (
              <Link
                key={type.id}
                to={`/search?type=${type.id}`}
                className={`${type.color} border-2 rounded-xl p-6 text-center hover:shadow-md transition-all duration-200 hover:-translate-y-1 group`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{type.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
                <p className="text-sm text-gray-600">{type.count}+ available</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked premium properties for your business success
            </p>
          </div>

          <FeaturedProperties properties={featuredProperties} loading={loading} />

          <div className="text-center mt-8">
            <Link to="/search" className="btn btn-primary btn-lg">
              <span>View All Properties</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ConnectSpace
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to find and secure the perfect commercial property
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="feature-card group">
                <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-3xl text-white shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by thousands of businesses across India
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Find Your Perfect Space?
            </h2>
            <p className="text-xl text-blue-50 mb-8">
              Join thousands of successful businesses who found their ideal commercial property with us
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/search" className="btn btn-lg bg-white text-blue-600 hover:bg-gray-50">
                <span>🔍</span>
                <span>Start Searching</span>
              </Link>
              <button onClick={handleListProperty} className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-blue-600">
                <span>➕</span>
                <span>List Property Free</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.type}
        onClose={closeAuthModal}
        onSuccess={() => navigate('/dashboard?tab=properties&action=add')}
      />
    </div>
  );
};

export default Homepage;
