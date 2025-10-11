// Advanced Features - Authentication Protected
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PaymentFinancialSystem from '../components/Financial/PaymentFinancialSystem';
import MaintenanceIoTSystem from '../components/Maintenance/MaintenanceIoTSystem';
import AIPoweredSystem from '../components/AI/AIPoweredSystem';
import TenantManagement from '../components/Tenant/TenantManagement';
import AgentManagement from '../components/Agent/AgentManagement';
import './AdvancedFeaturesDemo.css';

const AdvancedFeaturesDemo = () => {
  const { isAuthenticated, user } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/?login=true" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container-custom py-6">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Features</h1>
          <p className="text-gray-600 mt-2">Professional property management tools</p>
        </div>
      </header>

      {/* Clean Navigation Grid */}
      <div className="container-custom section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Link to="analytics" className="card card-hover group">
            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">Analytics</h3>
              <p className="text-gray-600 text-sm">Performance insights</p>
            </div>
          </Link>
          
          <Link to="landlord" className="card card-hover group">
            <div className="text-center">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">Landlord Tools</h3>
              <p className="text-gray-600 text-sm">Property management</p>
            </div>
          </Link>
          
          <Link to="financial" className="card card-hover group">
            <div className="text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">Financial</h3>
              <p className="text-gray-600 text-sm">Payments & reports</p>
            </div>
          </Link>
          
          <Link to="maintenance" className="card card-hover group">
            <div className="text-center">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">Maintenance</h3>
              <p className="text-gray-600 text-sm">Work orders & IoT</p>
            </div>
          </Link>
          
          <Link to="ai" className="card card-hover group">
            <div className="text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">AI Features</h3>
              <p className="text-gray-600 text-sm">Smart automation</p>
            </div>
          </Link>
          
          <Link to="tenants" className="card card-hover group">
            <div className="text-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">Tenants</h3>
              <p className="text-gray-600 text-sm">Tenant lifecycle</p>
            </div>
          </Link>
          
          <Link to="agents" className="card card-hover group">
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">Agents</h3>
              <p className="text-gray-600 text-sm">Performance tracking</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="container-custom pb-16">
        <Routes>
          <Route index element={<AuthenticatedWelcome user={user} />} />
          <Route path="analytics" element={
            <div className="card text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">📊</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Advanced Analytics</h1>
              <p className="text-gray-600">Comprehensive analytics dashboard will be available here.</p>
            </div>
          } />
          <Route path="landlord" element={
            <div className="card text-center max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🏠</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Advanced Landlord Tools</h1>
              <p className="text-gray-600">Advanced landlord management tools will be available here.</p>
            </div>
          } />
          <Route path="financial" element={<PaymentFinancialSystem />} />
          <Route path="maintenance" element={<MaintenanceIoTSystem />} />
          <Route path="ai" element={<AIPoweredSystem />} />
          <Route path="tenants" element={<TenantManagement />} />
          <Route path="agents" element={<AgentManagement />} />
        </Routes>
      </main>
    </div>
  );
};

const AuthenticatedWelcome = ({ user }) => {
  return (
    <div className="welcome-page">
      <div className="container">
        <div className="welcome-content">
          <h1>Welcome, {user?.name || 'User'}!</h1>
          <p className="welcome-subtitle">Choose a feature to get started</p>
          
          <div className="status-badge">
            <span className="status-dot"></span>
            All systems online
          </div>
          
          <div className="quick-stats">
            <div className="stat-item">
              <div className="stat-number">7</div>
              <div className="stat-label">Available Features</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFeaturesDemo;