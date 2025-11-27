import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import StudentManagement from './pages/admin/StudentManagement';
import AcademicStructure from './pages/admin/AcademicStructure';
import ResultsManagement from './pages/admin/ResultsManagement';
import TranscriptManagement from './pages/admin/TranscriptManagement';
import GradeViewing from './pages/admin/GradeViewing';
import AttendanceManagement from './pages/manager/AttendanceManagement';
import MyCourses from './pages/teacher/MyCourses';
import GradeSubmission from './pages/teacher/GradeSubmission';
import Settings from './pages/Settings';

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-4xl font-bold text-red-600">403 - Unauthorized</h1>
    <p className="mt-4 text-gray-600">You do not have permission to access this page.</p>
  </div>
);

const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-full">
    <h1 className="text-4xl font-bold text-gray-800">404 - Page Not Found</h1>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes wrapped in Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Home />} />

            {/* Dashboard - Admin only */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={['admin', 'schooling_manager']}>
                  <StudentManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/academic"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AcademicStructure />
                </ProtectedRoute>
              }
            />

            <Route
              path="/results"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ResultsManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transcripts"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TranscriptManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/grades"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <GradeViewing />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="/teacher/my-courses"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <MyCourses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/grades/enter/:tueId"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <GradeSubmission />
                </ProtectedRoute>
              }
            />

            {/* Manager Routes */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'schooling_manager']}>
                  <AttendanceManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'schooling_manager']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
