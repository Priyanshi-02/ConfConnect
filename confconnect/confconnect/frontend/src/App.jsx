import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import RoomsPage from './pages/RoomsPage';
import MyBookings from './pages/MyBookings';
import AdminPanel from './pages/AdminPanel';
import AddRoom from './pages/AddRoom';
import ProfilePage from './pages/ProfilePage';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/auth/callback" element={<LoginPage />} />
    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="rooms" element={<RoomsPage />} />
      <Route path="my-bookings" element={<MyBookings />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      <Route path="admin/add-room" element={<AdminRoute><AddRoom /></AdminRoute>} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
