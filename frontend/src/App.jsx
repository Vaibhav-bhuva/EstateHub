import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Auth Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const PropertyList = lazy(() => import('./pages/property/PropertyList'));
const PropertyDetail = lazy(() => import('./pages/property/PropertyDetail'));

// Seller Pages
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const SellerProperties = lazy(() => import('./pages/seller/SellerProperties'));
const AddProperty = lazy(() => import('./pages/seller/AddProperty'));
const EditProperty = lazy(() => import('./pages/seller/EditProperty'));
const SellerInquiries = lazy(() => import('./pages/seller/SellerInquiries'));
const SellerProfile = lazy(() => import('./pages/seller/SellerProfile'));
const PriceEstimator = lazy(() => import('./pages/seller/PriceEstimator'));

// Buyer Pages
const BuyerDashboard = lazy(() => import('./pages/buyer/BuyerDashboard'));
const Wishlist = lazy(() => import('./pages/buyer/Wishlist'));
const BuyerInquiries = lazy(() => import('./pages/buyer/BuyerInquiries'));
const BuyerProfile = lazy(() => import('./pages/buyer/BuyerProfile'));
const BudgetEstimator = lazy(() => import('./pages/buyer/BudgetEstimator'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const AdminMLStats = lazy(() => import('./pages/admin/AdminMLStats'));
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'));

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (user) {
    if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/buyer/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<PropertyList />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
        </Route>

        {/* Seller Routes */}
        <Route element={
          <ProtectedRoute roles={['seller']}>
            <DashboardLayout role="seller" />
          </ProtectedRoute>
        }>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/properties" element={<SellerProperties />} />
          <Route path="/seller/properties/add" element={<AddProperty />} />
          <Route path="/seller/properties/edit/:id" element={<EditProperty />} />
          <Route path="/seller/inquiries" element={<SellerInquiries />} />
          <Route path="/seller/profile" element={<SellerProfile />} />
          <Route path="/seller/price-estimator" element={<PriceEstimator />} />
        </Route>

        {/* Buyer Routes */}
        <Route element={
          <ProtectedRoute roles={['buyer']}>
            <DashboardLayout role="buyer" />
          </ProtectedRoute>
        }>
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/wishlist" element={<Wishlist />} />
          <Route path="/buyer/inquiries" element={<BuyerInquiries />} />
          <Route path="/buyer/profile" element={<BuyerProfile />} />
          <Route path="/buyer/budget-estimator" element={<BudgetEstimator />} />
        </Route>

        {/* Admin Routes */}
        <Route element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/properties" element={<AdminProperties />} />
          <Route path="/admin/inquiries" element={<AdminInquiries />} />
          <Route path="/admin/ml" element={<AdminMLStats />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
