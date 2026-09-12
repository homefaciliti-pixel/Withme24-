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
import { CustomerLogin } from './pages/CustomerLogin';
import { PartnerLogin } from './pages/PartnerLogin';
import { PartnerRegister } from './pages/PartnerRegister';
import { PartnerForgotPassword } from './pages/PartnerForgotPassword';
import { PartnerApplicationStatus } from './pages/PartnerApplicationStatus';
import { SafetyCenter } from './pages/SafetyCenter';
import { CompanionsDirectory } from './pages/CompanionsDirectory';
import { CompanionDetail } from './pages/CompanionDetail';
import { Services } from './pages/Services';
import { HowItWorks } from './pages/HowItWorks';
import { BecomePartner } from './pages/BecomePartner';
import { Pricing } from './pages/Pricing';
import { HelpFAQ } from './pages/HelpFAQ';
import { LegalPolicies } from './pages/LegalPolicies';

import { ExploreFeed } from './pages/ExploreFeed';
import { PartnerRequests } from './pages/PartnerRequests';
import { VerificationHub } from './pages/VerificationHub';
import { ActivityChatAndCall } from './pages/ActivityChatAndCall';

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
import { PartnerManager } from './pages/AdminDashboard/PartnerManager';
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
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/partner/login" element={<PartnerLogin />} />
          <Route path="/partner/register" element={<PartnerRegister />} />
          <Route path="/partner/forgot-password" element={<PartnerForgotPassword />} />
          <Route
            path="/partner/application-status"
            element={
              <ProtectedRoute>
                <PartnerApplicationStatus />
              </ProtectedRoute>
            }
          />
          <Route path="/safety" element={<SafetyCenter />} />
          <Route path="/companions" element={<CompanionsDirectory />} />
          <Route path="/find-partner" element={<CompanionsDirectory />} />
          <Route path="/companions/:id" element={<CompanionDetail />} />
          <Route path="/partner/:id" element={<CompanionDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/become-partner" element={<BecomePartner />} />
          <Route path="/partner-benefits" element={<BecomePartner />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/help" element={<HelpFAQ />} />
          <Route path="/faq" element={<HelpFAQ />} />
          <Route path="/terms" element={<LegalPolicies />} />
          <Route path="/privacy" element={<LegalPolicies />} />
          <Route path="/code-of-conduct" element={<LegalPolicies />} />
          <Route path="/refund-policy" element={<LegalPolicies />} />
          <Route path="/cancellation-policy" element={<LegalPolicies />} />
          <Route path="/explore" element={<ExploreFeed />} />
          <Route path="/partner-requests" element={<PartnerRequests />} />
          <Route path="/verification-hub" element={<VerificationHub />} />
          <Route path="/chat" element={<ActivityChatAndCall />} />
          <Route path="/call" element={<ActivityChatAndCall />} />
          <Route path="/partner-guidelines" element={<LegalPolicies />} />

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
            path="/admin/partners"
            element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'MODERATOR']}>
                <PartnerManager />
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
