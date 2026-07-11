import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route so that only authenticated users can access it.
 * Unauthenticated visitors are redirected to /login.
 * Shows nothing while the auth state is still loading.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a full-screen loading state while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
