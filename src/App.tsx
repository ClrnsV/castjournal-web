import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { MyCatches } from './pages/catches/MyCatches';
import { CatchForm } from './pages/catches/CatchForm';
import { CatchDetail } from './pages/catches/CatchDetail';
import { MyLocations } from './pages/locations/MyLocations';
import { MyProfile } from './pages/profile/MyProfile';
import { Feed } from './pages/feed/Feed';
import { PublicProfile } from './pages/profile/PublicProfile';
import { Notifications } from './pages/notifications/Notifications';
import { Analytics } from './pages/analytics/Analytics';
import { ExportPage } from './pages/export/ExportPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { ManageUsers } from './pages/admin/ManageUsers';
import { ManageSpecies } from './pages/admin/ManageSpecies';
import { SystemReports } from './pages/admin/SystemReports';
import { AuditLogs } from './pages/admin/AuditLogs';
import { Backup } from './pages/admin/Backup';
import { FeedLayout } from './components/FeedLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { PrivacyPolicy } from './pages/PrivacyPolicy';




function App() {
  return (
   <Routes>
       <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        {/* Feed gets the wider shell */}
        <Route element={<FeedLayout />}>
          <Route path="/" element={<Feed />} />
          <Route path="/feed" element={<Feed />} />
        </Route>

        {/* Everything else keeps the narrow shell */}
        <Route element={<Layout />}>
          <Route path="/catches" element={<MyCatches />} />
          <Route path="/catches/new" element={<CatchForm />} />
          <Route path="/catches/:id" element={<CatchDetail />} />
          <Route path="/catches/:id/edit" element={<CatchForm />} />

          <Route path="/locations" element={<MyLocations />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/anglers/:userId" element={<PublicProfile />} />

          <Route path="/notifications" element={<Notifications />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/export" element={<ExportPage />} />

           <Route path="/privacy" element={<PrivacyPolicy />} />

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<ManageUsers />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="species" element={<ManageSpecies />} />
              <Route path="reports" element={<SystemReports />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="backup" element={<Backup />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;