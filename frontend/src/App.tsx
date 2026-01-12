import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Suspense, lazy, useState } from 'react';
import type { ReactNode } from 'react';
import './index.css';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Common Pages - Using lazy loading
const HomePage = lazy(() => import('./pages/HomePage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Candidate Pages
const CVManagementPage = lazy(() => import('./pages/candidate/CVManagementPage'));
const SavedJobsPage = lazy(() => import('./pages/candidate/SavedJobsPage'));
const AppliedJobsPage = lazy(() => import('./pages/candidate/AppliedJobsPage'));

// Employer Pages
const CreateJobPage = lazy(() => import('./pages/employer/CreateJobPage'));
const EditJobPage = lazy(() => import('./pages/employer/EditJobPage'));
const ManageJobsPage = lazy(() => import('./pages/employer/ManageJobsPage'));
const ViewCVPage = lazy(() => import('./pages/employer/ViewCVPage'));
const SearchCandidatesPage = lazy(() => import('./pages/employer/SearchCandidatesPage'));
const InterviewSchedulePage = lazy(() => import('./pages/employer/InterviewSchedulePage'));
const InterviewDetailPage = lazy(() => import('./pages/employer/InterviewDetailPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminJobsPage = lazy(() => import('./pages/admin/AdminJobsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));

// Layout
import Navbar from './components/Navbar';
// import Sidebar from './components/Sidebar';

// Loading component
function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-background)'
    }}>
      <div className="loading" style={{ color: 'var(--color-text)' }}>Đang tải...</div>
    </div>
  );
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

// Redirect users to role-specific pages
function RoleBasedRedirect() {
  const { profile } = useAuth();

  if (!profile) return <Loading />;

  switch (profile.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'employer':
      return <Navigate to="/employer/dashboard" replace />;
    case 'school':
      return <Navigate to="/school/dashboard" replace />;
    case 'candidate':
    default:
      return <HomePage />;
  }
}

function AppRoutes() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // TEMPORARILY HIDE SIDEBAR ON ALL PAGES
  const showSidebar = false;

  return (
    <>
      {user && <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />}
      {/* {showSidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />} */}

      <div
        className={showSidebar ? 'main-content' : ''}
        style={showSidebar ? {
          marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 0,
          transition: 'margin-left var(--transition-base)'
        } : {}}
      >
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <RoleBasedRedirect />
                </PrivateRoute>
              }
            />

            <Route
              path="/jobs"
              element={
                <PrivateRoute>
                  <JobsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/jobs/:id"
              element={
                <PrivateRoute>
                  <JobDetailPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />

            {/* Candidate Routes */}
            <Route
              path="/candidate/cv"
              element={
                <PrivateRoute>
                  <CVManagementPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/candidate/saved-jobs"
              element={
                <PrivateRoute>
                  <SavedJobsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/candidate/applied-jobs"
              element={
                <PrivateRoute>
                  <AppliedJobsPage />
                </PrivateRoute>
              }
            />

            {/* Employer Routes */}
            <Route
              path="/employer/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/jobs"
              element={
                <PrivateRoute>
                  <ManageJobsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/jobs/create"
              element={
                <PrivateRoute>
                  <CreateJobPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/jobs/:id/edit"
              element={
                <PrivateRoute>
                  <EditJobPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/cv/:cvId"
              element={
                <PrivateRoute>
                  <ViewCVPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/candidates"
              element={
                <PrivateRoute>
                  <SearchCandidatesPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/interviews"
              element={
                <PrivateRoute>
                  <InterviewSchedulePage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/interviews/:id"
              element={
                <PrivateRoute>
                  <InterviewDetailPage />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/jobs"
              element={
                <PrivateRoute>
                  <AdminJobsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <AdminUsersPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

function AppWrapper() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  );
}

export default App;
