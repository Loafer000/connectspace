import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import TenantDashboard from './TenantDashboard';
import OwnerDashboard from './OwnerDashboard';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Don't render anything while checking authentication
  if (!isAuthenticated) {
    return null;
  }

  // Route to appropriate dashboard based on user type
  if (user?.userType === 'agent') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-custom py-12">
          <div className="card text-center max-w-2xl mx-auto animate-fade-in">
            <div className="text-6xl mb-6">🏢</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Agent Dashboard</h1>
            <p className="text-gray-600 text-lg">Welcome, {user?.name}! Your agent tools will be available here.</p>
            <div className="mt-8">
              <button className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (user?.userType === 'landlord' || user?.userType === 'owner') {
    return <OwnerDashboard />;
  } else {
    return <TenantDashboard />;
  }
};

export default Dashboard;
