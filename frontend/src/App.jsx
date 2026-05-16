import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyPage from './pages/VerifyPage';
import Dashboard from './pages/admin/Dashboard';
import Events from './pages/admin/Events';
import EventDetail from './pages/admin/EventDetail';
import Certificates from './pages/admin/Certificates';
import ToastProvider from './components/ToastProvider';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner spinner-lg"></div><p>Loading...</p></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <div className="app-bg" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
        <Route path="/admin/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
        <Route path="/admin/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
