import { Routes, Route } from 'react-router-dom';
import NavBar from './components/common/NavBar';
import Home from './components/common/Home';
import Login from './components/common/Login';
import ForgotPassword from './components/common/ForgotPassword';
import Register from './components/common/Register';
import AllCourses from './components/common/AllCourses';
import CourseDetail from './components/common/CourseDetail';

import StudentHome from './components/user/student/StudentHome';
import CourseContent from './components/user/student/CourseContent';
import Certificate from './components/user/student/Certificate';

import TeacherHome from './components/user/teacher/TeacherHome';
import ManageCourse from './components/user/teacher/ManageCourse';

import AdminLogin from './components/admin/AdminLogin';
import AdminHome from './components/admin/AdminHome';
import AdminAllCourses from './components/admin/AllCourses';

// Protected Route Component
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.type)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Hide NavBar on admin pages
function Layout({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdminPage && <NavBar />}
      {children}
    </>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<AllCourses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />

        {/* Student Routes */}
        <Route
          path="/student"
          element={<ProtectedRoute allowedRoles={['student']}><StudentHome /></ProtectedRoute>}
        />
        <Route
          path="/course/:courseId"
          element={<ProtectedRoute allowedRoles={['student']}><CourseContent /></ProtectedRoute>}
        />
        <Route
          path="/certificate/:courseId"
          element={<ProtectedRoute allowedRoles={['student']}><Certificate /></ProtectedRoute>}
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherHome /></ProtectedRoute>}
        />
        <Route
          path="/teacher/course/:courseId"
          element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><ManageCourse /></ProtectedRoute>}
        />

        {/* Admin Routes — dedicated login, no NavBar */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminHome /></ProtectedRoute>}
        />
        <Route
          path="/admin/courses"
          element={<ProtectedRoute allowedRoles={['admin']}><AdminAllCourses /></ProtectedRoute>}
        />
      </Routes>
    </Layout>
  );
}

export default App;
