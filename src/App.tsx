import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterStudentPage } from './pages/public/RegisterStudentPage';
import { RegisterFacultyPage } from './pages/public/RegisterFacultyPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Layouts
import { StudentLayout } from './layouts/StudentLayout';
import { FacultyLayout } from './layouts/FacultyLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { FindMentorPage } from './pages/student/FindMentorPage';
import { StudentRequestsPage } from './pages/student/StudentRequestsPage';
import { MyMentoringPage } from './pages/student/MyMentoringPage';
import { MyMentorPage } from './pages/student/MyMentorPage';
import { AIMentorPage } from './pages/student/AIMentorPage';
import { GoalsRoadmapPage } from './pages/student/GoalsRoadmapPage';
import { TasksPage } from './pages/student/TasksPage';
import { ProgressPage } from './pages/student/ProgressPage';
import { MessagesPage } from './pages/student/MessagesPage';
import { AppointmentsPage } from './pages/student/AppointmentsPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { SettingsPage } from './pages/student/SettingsPage';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyProfilePage } from './pages/faculty/FacultyProfilePage';
import { FacultyRequestsPage } from './pages/faculty/FacultyRequestsPage';
import { FacultyStudentsPage } from './pages/faculty/FacultyStudentsPage';
import { FacultyTasksPage } from './pages/faculty/FacultyTasksPage';
import { FacultyAvailabilityPage } from './pages/faculty/FacultyAvailabilityPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentVerificationPage } from './pages/admin/StudentVerificationPage';
import { FacultyVerificationPage } from './pages/admin/FacultyVerificationPage';
import { AllUsersPage } from './pages/admin/AllUsersPage';
import { DepartmentsPage } from './pages/admin/DepartmentsPage';
import { MentorshipManagementPage } from './pages/admin/MentorshipManagementPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AnnouncementsPage } from './pages/admin/AnnouncementsPage';
import { AIManagementPage } from './pages/admin/AIManagementPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

// Role Guard Component
const ProtectedRoute: React.FC<{
  allowedRoles: Array<'student' | 'faculty' | 'admin'>;
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
        Authenticating with college network...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admins can inspect student and faculty layouts for governance testing
  if (user.role === 'admin' || allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Redirect to their own dashboard
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/student" element={<RegisterStudentPage />} />
          <Route path="/register/faculty" element={<RegisterFacultyPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Student Portal */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="find-mentor" element={<FindMentorPage />} />
            <Route path="my-mentoring" element={<MyMentoringPage />} />
            <Route path="my-mentor" element={<MyMentoringPage />} />
            <Route path="requests" element={<StudentRequestsPage />} />
            <Route path="ai-mentor" element={<AIMentorPage />} />
            <Route path="goals" element={<GoalsRoadmapPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Faculty Portal */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/faculty/dashboard" replace />} />
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="profile" element={<FacultyProfilePage />} />
            <Route path="requests" element={<FacultyRequestsPage />} />
            <Route path="students" element={<FacultyStudentsPage />} />
            <Route path="mentorships" element={<FacultyStudentsPage />} />
            <Route path="tasks" element={<FacultyTasksPage />} />
            <Route path="progress" element={<FacultyStudentsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="availability" element={<FacultyAvailabilityPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AllUsersPage />} />
            <Route path="students/verification" element={<StudentVerificationPage />} />
            <Route path="faculty/verification" element={<FacultyVerificationPage />} />
            <Route path="students" element={<AllUsersPage />} />
            <Route path="faculty" element={<AllUsersPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="mentorships" element={<MentorshipManagementPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="ai-management" element={<AIManagementPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
