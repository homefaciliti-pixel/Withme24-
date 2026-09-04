import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Common/Toast';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';

// Guards
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';

// Public Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { SafetyCenter } from './pages/SafetyCenter';
import { CompanionsDirectory } from './pages/CompanionsDirectory';
import { CompanionDetail } from './pages/CompanionDetail';

// Customer Pages
import { CustomerDashboard } from './pages/CustomerDashboard/Dashboard';
import { CustomerBookings } from './pages/CustomerDashboard/Bookings';
import { CustomerProfile } from './pages/CustomerDashboard/Profile';
import { BookingDetail } from './pages/CustomerDashboard/BookingDetail';

// Companion Pages
import { CompanionDashboard } from './pages/CompanionDashboard/Dashboard';
import { CompanionBookings } from './pages/CompanionDashboard/Bookings';
import { CompanionProfileEdit } from './pages/CompanionDashboard/ProfileEdit';
import { CompanionAvailability } from './pages/CompanionDashboard/Availability';
import { CompanionEarnings } from './pages/CompanionDashboard/Earnings';
import { CompanionVerification } from './pages/CompanionDashboard/Verification';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard/Dashboard';
import { AdminKYCManager } from './pages/AdminDashboard/KYCManager';
import { AdminReportsManager } from './pages/AdminDashboard/ReportsManager';
import { AdminPayoutsManager } from './pages/AdminDashboard/PayoutsManager';
import { AdminAuditLogs } from './pages/AdminDashboard/AuditLogs';
import { AdminMetadataManager } from './pages/AdminDashboard/MetadataManager';

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/safety" element={<SafetyCenter />} />
          <Route path="/companions" element={<CompanionsDirectory />} />
          <Route path="/companions/:id" element={<CompanionDetail />} />

          {/* Customer Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/bookings"
            element={
              <ProtectedRoute>
                <CustomerBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />

          {/* Companion Dashboard Routes */}
          <Route
            path="/companion-dashboard"
            element={
              <RoleProtectedRoute allowedRoles={['COMPANION', 'SUPER_ADMIN']}>
                <CompanionDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/companion-dashboard/bookings"
            element={
              <RoleProtectedRoute allowedRoles={['COMPANION', 'SUPER_ADMIN']}>
                <CompanionBookings />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/companion-dashboard/profile"
            element={
              <RoleProtectedRoute allowedRoles={['COMPANION', 'SUPER_ADMIN']}>
                <CompanionProfileEdit />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/companion-dashboard/availability"
            element={
              <RoleProtectedRoute allowedRoles={['COMPANION', 'SUPER_ADMIN']}>
                <CompanionAvailability />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/companion-dashboard/earnings"
            element={
              <RoleProtectedRoute allowedRoles={['COMPANION', 'SUPER_ADMIN']}>
                <CompanionEarnings />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/companion-dashboard/verification"
            element={
              <ProtectedRoute>
                <CompanionVerification />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'MODERATOR']}>
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/kyc"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'MODERATOR']}>
                <AdminKYCManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'MODERATOR']}>
                <AdminReportsManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/payouts"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'FINANCE']}>
                <AdminPayoutsManager />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminAuditLogs />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/metadata"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminMetadataManager />
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default App;
