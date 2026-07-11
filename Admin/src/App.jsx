import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Flights from './pages/Flights';
import Tickets from './pages/Tickets';
import VisaTypes from './pages/VisaTypes';
import VisaApplications from './pages/VisaApplications';
import TourPackages from './pages/TourPackages';
import TourBookings from './pages/TourBookings';
import Cargo from './pages/Cargo';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Expenses from './pages/Expenses';
import Staff from './pages/Staff';
import Reports from './pages/Reports/index.jsx';
import Roles from './pages/Roles';
import UsersPage from './pages/Users';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes — require authentication */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/flights" element={<Flights />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/visa-types" element={<VisaTypes />} />
                    <Route path="/visa-applications" element={<VisaApplications />} />
                    <Route path="/tour-packages" element={<TourPackages />} />
                    <Route path="/tour-bookings" element={<TourBookings />} />
                    <Route path="/cargo" element={<Cargo />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/staff" element={<Staff />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/roles" element={<Roles />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
