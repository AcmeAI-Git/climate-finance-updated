import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import existing page components
import LandingPage from '../pages/LandingPage';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetails';
import ProjectFormPage from '../pages/ProjectFormPage';
import FundingSources from '../pages/FundingSources';
import FundingSourceDetails from '../pages/FundingSourceDetails';
import FundingSourceFormPage from '../pages/FundingSourceFormPage';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AdminProjects from '../pages/AdminProjects';
import AdminAgencies from '../pages/AdminAgencies';
import AdminFundingSources from '../pages/AdminFundingSources';
import AdminLocations from '../pages/AdminLocations';
import AdminProjectApproval from '../pages/AdminProjectApproval';
import UserFormPage from '../pages/UserFormPage';
import AgencyFormPage from '../pages/AgencyFormPage';
import LocationFormPage from '../pages/LocationFormPage';
import AboutPage from '../pages/AboutPage';

// Protected route wrapper that uses AuthContext
function ProtectedRoute({ children, requireAuth = true }) {
  const { isAuthenticated } = useAuth();
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // Optional: Add role-based access control
  // if (!user || !['Super Admin', 'Project Manager', 'Finance Admin'].includes(user.role)) {
  //   return <Navigate to="/" replace />;
  // }
  
  return children;
}

// 404 Page component
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-400">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2">The page you are looking for does not exist.</p>
        <a href="/" className="text-purple-600 hover:text-purple-700 mt-4 inline-block">
          Go back to home
        </a>
      </div>
    </div>
  );
}

const Routing = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* Projects routes */}
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/projects/new" element={<ProjectFormPage mode="public" />} />
      <Route path="/projects/:id/edit" element={
        <ProtectedRoute>
          <ProjectFormPage mode="edit" />
        </ProtectedRoute>
      } />
      
      {/* Funding sources routes */}
      <Route path="/funding-sources" element={<FundingSources />} />
      <Route path="/funding-sources/:sourceId" element={<FundingSourceDetails />} />
      <Route path="/funding-sources/new" element={
        <ProtectedRoute>
          <FundingSourceFormPage mode="add" />
        </ProtectedRoute>
      } />
      <Route path="/funding-sources/:id/edit" element={
        <ProtectedRoute>
          <FundingSourceFormPage mode="edit" />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      
      {/* Admin Users */}
      <Route path="/admin/users" element={
        <AdminRoute>
          <AdminUsers />
        </AdminRoute>
      } />
      <Route path="/admin/users/add" element={<Navigate to="/admin/users/new" replace />} />
      <Route path="/admin/users/new" element={
        <AdminRoute>
          <UserFormPage mode="add" />
        </AdminRoute>
      } />
      <Route path="/admin/users/:id/edit" element={
        <AdminRoute>
          <UserFormPage mode="edit" />
        </AdminRoute>
      } />
      
      {/* Admin Projects */}
      <Route path="/admin/projects" element={
        <AdminRoute>
          <AdminProjects />
        </AdminRoute>
      } />
      <Route path="/admin/projects/add" element={<Navigate to="/admin/projects/new" replace />} />
      <Route path="/admin/projects/new" element={
        <AdminRoute>
          <ProjectFormPage mode="add" />
        </AdminRoute>
      } />
      <Route path="/admin/projects/:id/edit" element={
        <AdminRoute>
          <ProjectFormPage mode="edit" />
        </AdminRoute>
      } />
      
      {/* Admin Agencies */}
      <Route path="/admin/agencies" element={
        <AdminRoute>
          <AdminAgencies />
        </AdminRoute>
      } />
      <Route path="/admin/agencies/add" element={<Navigate to="/admin/agencies/new" replace />} />
      <Route path="/admin/agencies/new" element={
        <AdminRoute>
          <AgencyFormPage mode="add" />
        </AdminRoute>
      } />
      <Route path="/admin/agencies/:id/edit" element={
        <AdminRoute>
          <AgencyFormPage mode="edit" />
        </AdminRoute>
      } />
      
      {/* Admin Funding Sources */}
      <Route path="/admin/funding-sources" element={
        <AdminRoute>
          <AdminFundingSources />
        </AdminRoute>
      } />
      <Route path="/admin/funding-sources/add" element={<Navigate to="/admin/funding-sources/new" replace />} />
      <Route path="/admin/funding-sources/new" element={
        <AdminRoute>
          <FundingSourceFormPage mode="add" />
        </AdminRoute>
      } />
      <Route path="/admin/funding-sources/:id/edit" element={
        <AdminRoute>
          <FundingSourceFormPage mode="edit" />
        </AdminRoute>
      } />
      
      {/* Admin Locations */}
      <Route path="/admin/locations" element={
        <AdminRoute>
          <AdminLocations />
        </AdminRoute>
      } />
      <Route path="/admin/locations/add" element={<Navigate to="/admin/locations/new" replace />} />
      <Route path="/admin/locations/new" element={
        <AdminRoute>
          <LocationFormPage mode="add" />
        </AdminRoute>
      } />
      <Route path="/admin/locations/:id/edit" element={
        <AdminRoute>
          <LocationFormPage mode="edit" />
        </AdminRoute>
      } />
      
      
      {/* Admin Project Approval */}
      <Route path="/admin/project-approval" element={
        <AdminRoute>
          <AdminProjectApproval />
        </AdminRoute>
      } />
      
      {/* Catch all - 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default Routing;