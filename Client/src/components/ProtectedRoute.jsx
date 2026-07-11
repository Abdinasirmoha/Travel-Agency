import { Navigate } from 'react-router-dom';
import { useCustomer } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { customer } = useCustomer();

  if (!customer) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
