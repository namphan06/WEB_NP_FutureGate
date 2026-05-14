import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Suspense, lazy, useState } from 'react';
import type { ReactNode } from 'react';
import './index.css';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Common Pages - Using lazy loading
const HomePage = lazy(() => import('./pages/HomePage'));
const JobsPage = lazy(() => import('./pages/JobsPage'));
const JobDetailPage = lazy(() => import('./pages/JobDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const JobSuggestPage = lazy(() => import('./pages/JobSuggestPage'));

// New Candidate Utility Pages
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const CareerNewsPage = lazy(() => import('./pages/CareerNewsPage'));
const CareerNewsDetailPage = lazy(() => import('./pages/CareerNewsDetailPage'));

// Candidate Pages
const CVManagementPage = lazy(() => import('./pages/candidate/CVManagementPage'));
const CVEditorPage = lazy(() => import('./pages/candidate/CVEditorPage'));
const SavedJobsPage = lazy(() => import('./pages/candidate/SavedJobsPage'));
const AppliedJobsPage = lazy(() => import('./pages/candidate/AppliedJobsPage'));

// Employer Pages
const CreateJobPage = lazy(() => import('./pages/employer/CreateJobPage'));
const EditJobPage = lazy(() => import('./pages/employer/EditJobPage'));
const ManageJobsPage = lazy(() => import('./pages/employer/ManageJobsPage'));
const JobApplicantsPage = lazy(() => import('./pages/employer/JobApplicantsPage'));
const ViewCVPage = lazy(() => import('./pages/employer/ViewCVPage'));
const SearchCandidatesPage = lazy(() => import('./pages/employer/SearchCandidatesPage'));
const SavedCandidatesPage = lazy(() => import('./pages/employer/SavedCandidatesPage'));
const InterviewSchedulePage = lazy(() => import('./pages/employer/InterviewSchedulePage'));
const InterviewDetailPage = lazy(() => import('./pages/employer/InterviewDetailPage'));
const PartnershipJobsPage = lazy(() => import('./pages/employer/PartnershipJobsPage'));
const EmployerSchoolsPage = lazy(() => import('./pages/employer/EmployerSchoolsPage'));
const InternEvaluationPage = lazy(() => import('./pages/employer/InternEvaluationPage'));
const PendingRecruitmentsPage = lazy(() => import('./pages/employer/PendingRecruitmentsPage'));

// School Pages
const SchoolDashboardPage = lazy(() => import('./pages/school/SchoolDashboardPage'));
const SchoolPartnershipsPage = lazy(() => import('./pages/school/SchoolPartnershipsPage'));
const SchoolStudentsPage = lazy(() => import('./pages/school/SchoolStudentsPage'));
const SchoolCreateJobPage = lazy(() => import('./pages/school/SchoolCreateJobPage'));
const SchoolManageJobsPage = lazy(() => import('./pages/school/SchoolManageJobsPage'));
const SchoolPartnershipJobsPage = lazy(() => import('./pages/school/SchoolPartnershipJobsPage'));
const SchoolJobApplicantsPage = lazy(() => import('./pages/school/SchoolJobApplicantsPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminJobsPage = lazy(() => import('./pages/admin/AdminJobsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminNewsPage = lazy(() => import('./pages/admin/AdminNewsPage'));
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminMIQuestionsPage = lazy(() => import('./pages/admin/AdminMIQuestionsPage'));
const AdminMBTIPage = lazy(() => import('./pages/admin/AdminMBTIPage'));
const MITestPage = lazy(() => import('./pages/candidate/MITestPage'));
const MBTITestPage = lazy(() => import('./pages/candidate/MBTITestPage'));
const CandidateInterviewSchedulePage = lazy(() => import('./pages/candidate/InterviewSchedulePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));



const CompanyDetailPage = lazy(() => import('./pages/CompanyDetailPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));


// Layout
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Show sidebar only for Dashboard-like pages or when specifically needed
  const isDashboardRoute =
    location.pathname.startsWith('/employer/') ||
    location.pathname.startsWith('/admin/') ||
    location.pathname.startsWith('/school/') ||
    location.pathname.startsWith('/candidate/') ||
    location.pathname.startsWith('/chat') ||
    location.pathname === '/profile' ||
    location.pathname === '/settings';

  const showSidebar = !!user && isDashboardRoute;


  return (
    <>
      {user && <Navbar />}
      {showSidebar && <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />}

      <div
        className={showSidebar ? 'main-content' : ''}
        style={showSidebar ? {
          marginLeft: sidebarOpen ? '280px' : '88px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          paddingTop: 'var(--header-height)',
          minHeight: '100vh',
          background: '#F8FAFC',
          width: sidebarOpen ? 'calc(100% - 280px)' : 'calc(100% - 88px)'
        } : {}}
      >
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/terms"
              element={
                <PrivateRoute>
                  <TermsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/privacy"
              element={
                <PrivateRoute>
                  <PrivacyPage />
                </PrivateRoute>
              }
            />

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
              path="/company/:id"
              element={
                <PrivateRoute>
                  <CompanyDetailPage />
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

            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/jobs/suggest"
              element={
                <PrivateRoute>
                  <JobSuggestPage />
                </PrivateRoute>
              }
            />

            {/* Courses & News Routes */}
            <Route
              path="/courses"
              element={
                <PrivateRoute>
                  <CoursesPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/courses/:id"
              element={
                <PrivateRoute>
                  <CourseDetailPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/news"
              element={
                <PrivateRoute>
                  <CareerNewsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/news/:id"
              element={
                <PrivateRoute>
                  <CareerNewsDetailPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/candidate/cv"
              element={
                <PrivateRoute>
                  <CVManagementPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/candidate/cv/create"
              element={
                <PrivateRoute>
                  <CVManagementPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/cv-templates"
              element={
                <PrivateRoute>
                  <CVManagementPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/candidate/cv/:id/edit"
              element={
                <PrivateRoute>
                  <CVEditorPage />
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
            <Route
              path="/candidate/mi-test"
              element={
                <PrivateRoute>
                  <MITestPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/candidate/mbti-test"
              element={
                <PrivateRoute>
                  <MBTITestPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/candidate/interviews"
              element={
                <PrivateRoute>
                  <CandidateInterviewSchedulePage />
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
              path="/employer/jobs/:jobId/applicants"
              element={
                <PrivateRoute>
                  <JobApplicantsPage />
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
              path="/employer/candidates/saved"
              element={
                <PrivateRoute>
                  <SavedCandidatesPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/saved-candidates"
              element={
                <PrivateRoute>
                  <SavedCandidatesPage />
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

            <Route
              path="/employer/partnerships"
              element={
                <PrivateRoute>
                  <PartnershipJobsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/school-requests"
              element={
                <PrivateRoute>
                  <EmployerSchoolsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/schools"
              element={
                <PrivateRoute>
                  <EmployerSchoolsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/evaluations"
              element={
                <PrivateRoute>
                  <InternEvaluationPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employer/recruitment-decisions"
              element={
                <PrivateRoute>
                  <PendingRecruitmentsPage />
                </PrivateRoute>
              }
            />

            {/* School Routes */}
            <Route
              path="/school/dashboard"
              element={
                <PrivateRoute>
                  <SchoolDashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/school/partnerships"
              element={
                <PrivateRoute>
                  <SchoolPartnershipsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/school/students"
              element={
                <PrivateRoute>
                  <SchoolStudentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/school/jobs/create"
              element={
                <PrivateRoute>
                  <SchoolCreateJobPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/school/jobs"
              element={
                <PrivateRoute>
                  <SchoolManageJobsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/school/partnership-jobs"
              element={
                <PrivateRoute>
                  <SchoolPartnershipJobsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/school/jobs/:jobId/applicants"
              element={
                <PrivateRoute>
                  <SchoolJobApplicantsPage />
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

            <Route
              path="/admin/news"
              element={
                <PrivateRoute>
                  <AdminNewsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/courses"
              element={
                <PrivateRoute>
                  <AdminCoursesPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <PrivateRoute>
                  <AdminAnalyticsPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/mi-questions"
              element={
                <PrivateRoute>
                  <AdminMIQuestionsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/mbti"
              element={
                <PrivateRoute>
                  <AdminMBTIPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <ChatPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat/:conversationId"
              element={
                <PrivateRoute>
                  <ChatPage />
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
