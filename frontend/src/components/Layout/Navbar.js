import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' });
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Search', href: '/search', icon: '🔍' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
    { name: 'Contact', href: '/contact', icon: '📧' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const openAuthModal = (type) => {
    setAuthModal({ isOpen: true, type });
    setIsOpen(false);
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, type: 'login' });
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-white/95 backdrop-blur-sm py-3'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-xl font-bold">C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                  ConnectSpace
                </span>
                <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
                  Find Your Perfect Space
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive(item.href)
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Premium Link */}
              {isAuthenticated && (
                <Link
                  to="/advanced-features"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 border ${
                    isActive('/advanced-features')
                      ? 'bg-gradient-to-r from-teal-500 to-indigo-500 text-white border-transparent'
                      : 'border-teal-200 text-teal-600 hover:bg-teal-50'
                  }`}
                >
                  <span>⭐</span>
                  <span>Premium</span>
                </Link>
              )}
            </div>

            {/* User Menu & CTA */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Dashboard Link - Desktop */}
                  <Link
                    to="/dashboard"
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    <span>📊</span>
                    <span>Dashboard</span>
                  </Link>

                  {/* User Profile Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-teal-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-400 flex items-center justify-center text-white font-semibold">
                          {(user?.name || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-medium text-gray-700">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <span>📊</span>
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <span>👤</span>
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/favorites"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <span>❤️</span>
                          <span>Favorites</span>
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <span>🚪</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="hidden sm:inline-flex btn btn-secondary btn-sm"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="btn btn-primary btn-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {isOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 animate-slide-down">
              <div className="flex flex-col gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isActive(item.href)
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}

                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span className="text-lg">📊</span>
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/advanced-features"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-3 rounded-lg text-sm font-medium text-teal-600 hover:bg-teal-50 flex items-center gap-2 border border-teal-200"
                    >
                      <span>⭐</span>
                      <span>Premium Features</span>
                    </Link>
                  </>
                )}

                {!isAuthenticated && (
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={() => openAuthModal('login')}
                      className="btn btn-secondary w-full"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => openAuthModal('signup')}
                      className="btn btn-primary w-full"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className={scrolled ? "h-16" : "h-20"}></div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.type}
        onClose={closeAuthModal}
      />
    </>
  );
};

export default Navbar;
